import { Component, OnInit, inject, signal } from '@angular/core';
import { FashionAPIService } from '../service/fashion-apiservice';
import { Fashion } from '../classes/Fashion';

@Component({
  selector: 'app-bai58-fashion-admin',
  standalone: false,
  templateUrl: './bai58-fashion-admin.component.html',
  styleUrl: './bai58-fashion-admin.component.css'
})
export class Bai58FashionAdminComponent implements OnInit {
  private api = inject(FashionAPIService);

  fashions = signal<Fashion[]>([]);
  filteredFashions = signal<Fashion[]>([]);
  styles = signal<string[]>([]);
  isLoading = signal(true);
  errMessage = signal('');
  successMessage = signal('');

  currentView: 'list' | 'form' = 'list';
  isEditMode = false;

  // Form model
  formData: {
    _id?: string;
    IdF?: number;
    slug?: string;
    style: string;
    fashion_subject: string;
    fashion_detail: string;
    fashion_image: string;
  } = {
    style: 'STREET STYLE',
    fashion_subject: '',
    fashion_detail: '',
    fashion_image: ''
  };

  searchQuery = '';
  selectedStyle = 'ALL';

  // Modal xem chi tiết
  selectedFashionForDetail: Fashion | null = null;
  showDetailModal = false;

  // Modal xác nhận xóa
  fashionToDelete: Fashion | null = null;
  showDeleteConfirmModal = false;
  isDeleting = false;
  isSaving = false;

  availablePresetStyles = ['STREET STYLE', 'TRENDS', 'CELEBRITY STYLE', 'FASHION WEEK', 'RUNWAY'];

  ngOnInit(): void {
    this.loadFashions();
    this.loadStyles();
  }

  loadFashions(): void {
    this.isLoading.set(true);
    this.errMessage.set('');
    this.api.getFashions(this.selectedStyle !== 'ALL' ? this.selectedStyle : undefined).subscribe({
      next: (data) => {
        this.fashions.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errMessage.set(err.message || 'Không thể tải danh sách Fashion từ server.');
        this.isLoading.set(false);
      }
    });
  }

  loadStyles(): void {
    this.api.getStyles().subscribe({
      next: (res) => {
        const unique = Array.from(new Set(res)).filter(Boolean);
        this.styles.set(unique);
      },
      error: () => {}
    });
  }

  onStyleChange(style: string): void {
    this.selectedStyle = style;
    this.loadFashions();
  }

  applyFilter(): void {
    let list = this.fashions();
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(item =>
        (item.getTitle() && item.getTitle().toLowerCase().includes(q)) ||
        (item.style && item.style.toLowerCase().includes(q)) ||
        (item.slug && item.slug.toLowerCase().includes(q)) ||
        (item.IdF && item.IdF.toString().includes(q)) ||
        (item.getDetail() && item.getDetail().toLowerCase().includes(q))
      );
    }
    this.filteredFashions.set(list);
  }

  onSearchInput(): void {
    this.applyFilter();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilter();
  }

  createSlug(title: string, idf?: number): string {
    return Fashion.createSlug(title, idf);
  }

  // --- Form Actions ---
  openAddForm(): void {
    this.isEditMode = false;
    const maxIdF = Math.max(0, ...this.fashions().map(f => Number(f.IdF) || 0));
    const nextIdF = maxIdF + 1;

    this.formData = {
      IdF: nextIdF,
      style: 'STREET STYLE',
      fashion_subject: '',
      fashion_detail: '<p>Nhập nội dung bài viết thời trang mới...</p>',
      fashion_image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
      slug: ''
    };
    this.currentView = 'form';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openEditForm(item: Fashion): void {
    this.isEditMode = true;
    this.formData = {
      _id: item._id,
      IdF: item.IdF,
      slug: item.slug || Fashion.createSlug(item.getTitle(), item.IdF),
      style: item.style || 'STREET STYLE',
      fashion_subject: item.getTitle(),
      fashion_detail: item.getDetail(),
      fashion_image: item.getBase64String()
    };
    this.currentView = 'form';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelForm(): void {
    this.currentView = 'list';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onImageFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.formData.fashion_image = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveFashion(): void {
    if (!this.formData.fashion_subject.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết thời trang!');
      return;
    }

    this.formData.slug = Fashion.createSlug(this.formData.fashion_subject, this.formData.IdF);
    this.isSaving = true;
    if (this.isEditMode && this.formData._id) {
      this.api.putFashion(this.formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.showToast('Cập nhật bài viết Fashion thành công!');
          this.currentView = 'list';
          this.loadFashions();
          this.loadStyles();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Lỗi cập nhật: ' + (err.message || 'Lỗi server'));
        }
      });
    } else {
      this.api.postFashion(this.formData).subscribe({
        next: () => {
          this.isSaving = false;
          this.showToast('Thêm mới bài viết Fashion thành công!');
          this.currentView = 'list';
          this.loadFashions();
          this.loadStyles();
        },
        error: (err) => {
          this.isSaving = false;
          alert('Lỗi thêm mới: ' + (err.message || 'Lỗi server'));
        }
      });
    }
  }

  // --- Modals ---
  openDetail(fashion: Fashion): void {
    this.selectedFashionForDetail = fashion;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.selectedFashionForDetail = null;
    this.showDetailModal = false;
  }

  confirmDelete(fashion: Fashion): void {
    this.fashionToDelete = fashion;
    this.showDeleteConfirmModal = true;
  }

  cancelDelete(): void {
    this.fashionToDelete = null;
    this.showDeleteConfirmModal = false;
  }

  executeDelete(): void {
    if (!this.fashionToDelete || !this.fashionToDelete._id) return;
    this.isDeleting = true;

    this.api.deleteFashion(this.fashionToDelete._id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteConfirmModal = false;
        const deletedTitle = this.fashionToDelete?.getTitle() || 'bài viết';
        this.fashionToDelete = null;
        this.showToast(`Đã xóa thành công "${deletedTitle}"!`);
        this.loadFashions();
        this.loadStyles();
      },
      error: (err) => {
        this.isDeleting = false;
        this.errMessage.set('Lỗi khi xóa: ' + (err.message || 'Không thể xóa'));
        this.showDeleteConfirmModal = false;
      }
    });
  }

  showToast(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => {
      this.successMessage.set('');
    }, 4000);
  }

  cleanHtmlSnippet(html: string): string {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const txt = tmp.textContent || tmp.innerText || '';
    return txt.length > 90 ? txt.substring(0, 90) + '...' : txt;
  }

  getStyleBadgeClass(style: string): string {
    const s = (style || '').toUpperCase();
    if (s.includes('STREET')) return 'badge-street';
    if (s.includes('TREND')) return 'badge-trends';
    if (s.includes('CELEBRITY')) return 'badge-celebrity';
    return 'badge-default';
  }
}
