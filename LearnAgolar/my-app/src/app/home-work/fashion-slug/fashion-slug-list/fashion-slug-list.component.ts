import { Component, OnInit, signal, computed } from '@angular/core';
import { FashionSlug } from '../fashion-slug.model';
import { FashionSlugApiService } from '../fashion-slug-api.service';

@Component({
  selector: 'app-fashion-slug-list',
  standalone: false,
  templateUrl: './fashion-slug-list.component.html',
  styleUrl: './fashion-slug-list.component.css',
})
export class FashionSlugListComponent implements OnInit {
  // Signals quản lý trạng thái dữ liệu
  fashions = signal<FashionSlug[]>([]);
  isLoading = signal<boolean>(true);
  errMessage = signal<string>('');

  // Signals bộ lọc và tìm kiếm
  searchTerm = signal<string>('');
  selectedStyle = signal<string>('ALL');
  viewMode = signal<'grid' | 'table'>('grid');

  setViewMode(mode: 'grid' | 'table'): void {
    this.viewMode.set(mode);
  }

  // Danh sách các styles có sẵn
  availableStyles = computed(() => {
    const list = this.fashions();
    const stylesSet = new Set<string>();
    list.forEach(item => {
      if (item.style && item.style.trim()) {
        stylesSet.add(item.style.trim().toUpperCase());
      }
    });
    return ['ALL', ...Array.from(stylesSet)];
  });

  // Danh sách đã được lọc qua tìm kiếm & style
  filteredFashions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const style = this.selectedStyle().toUpperCase();

    return this.fashions().filter(item => {
      const matchStyle = style === 'ALL' || (item.style && item.style.toUpperCase() === style);
      const matchSearch =
        !term ||
        item.fashion_subject.toLowerCase().includes(term) ||
        item.slug.toLowerCase().includes(term) ||
        item.IdF.toString().includes(term) ||
        item.fashion_detail.toLowerCase().includes(term);

      return matchStyle && matchSearch;
    });
  });

  constructor(private fashionSlugService: FashionSlugApiService) {}

  ngOnInit(): void {
    this.loadFashionList();
  }

  loadFashionList(): void {
    this.isLoading.set(true);
    this.errMessage.set('');

    this.fashionSlugService.getFashionSlugList().subscribe({
      next: data => {
        this.fashions.set(data);
        this.isLoading.set(false);
      },
      error: err => {
        this.errMessage.set(err.message || 'Không thể tải danh sách thời trang');
        this.isLoading.set(false);
      },
    });
  }

  setFilterStyle(style: string): void {
    this.selectedStyle.set(style);
  }

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.selectedStyle.set('ALL');
  }

  /**
   * Làm sạch thẻ HTML trong chuỗi mô tả để hiển thị tóm tắt đẹp mắt
   */
  stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').trim();
  }
}
