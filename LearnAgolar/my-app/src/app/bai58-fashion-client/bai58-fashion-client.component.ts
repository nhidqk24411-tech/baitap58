import { Component, OnInit, inject, signal } from '@angular/core';
import { FashionAPIService } from '../service/fashion-apiservice';
import { Fashion } from '../classes/Fashion';

interface StyleGroup {
  styleName: string;
  items: Fashion[];
}

@Component({
  selector: 'app-bai58-fashion-client',
  standalone: false,
  templateUrl: './bai58-fashion-client.component.html',
  styleUrl: './bai58-fashion-client.component.css'
})
export class Bai58FashionClientComponent implements OnInit {
  public api = inject(FashionAPIService);

  fashions = signal<Fashion[]>([]);
  styleGroups = signal<StyleGroup[]>([]);
  availableStyles = signal<string[]>([]);
  isLoading = signal(true);
  errMessage = signal('');

  // Selected article for full detail view (Single Page Application seamless switch)
  selectedDetailFashion = signal<Fashion | null>(null);
  relatedFashions = signal<Fashion[]>([]);

  // Category toolbar items (Ảnh 1)
  categories = [
    { id: 'ALL', label: 'ALL STORIES' },
    { id: 'STREET STYLE', label: 'STREET STYLE' },
    { id: 'TRENDS', label: 'TRENDS' },
    { id: 'CELEBRITY STYLE', label: 'CELEBRITY STYLE' },
    { id: 'FASHION WEEK', label: 'FASHION WEEK' },
    { id: 'RUNWAY', label: 'RUNWAY' }
  ];

  searchStyleText = '';
  selectedDropdownStyle = 'ALL';
  currentDate = new Date();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errMessage.set('');

    this.api.getFashions().subscribe({
      next: (data) => {
        this.fashions.set(data);
        this.extractStyles(data);

        const activeCat = this.api.selectedCategory();
        if (activeCat && activeCat !== 'ALL') {
          this.applySelectedCategory(activeCat);
        } else {
          this.groupFashionsByStyle(data);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        this.errMessage.set(err.message || 'Không thể tải dữ liệu thời trang từ server.');
        this.isLoading.set(false);
      }
    });
  }

  extractStyles(data: Fashion[]): void {
    const set = new Set<string>();
    data.forEach(item => {
      if (item.style && item.style.trim().length > 0) {
        set.add(item.style.trim());
      }
    });
    this.availableStyles.set(Array.from(set));
  }

  groupFashionsByStyle(data: Fashion[], targetStyleFilter?: string, keywordFilter?: string): void {
    let filtered = [...data];

    if (targetStyleFilter && targetStyleFilter !== 'ALL') {
      const target = targetStyleFilter.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.style && (
          item.style.toLowerCase().trim() === target ||
          item.style.toLowerCase().includes(target)
        )
      );
    }

    if (keywordFilter && keywordFilter.trim().length > 0) {
      const kw = keywordFilter.toLowerCase().trim();
      filtered = filtered.filter(item =>
        (item.style && item.style.toLowerCase().includes(kw)) ||
        (item.getTitle() && item.getTitle().toLowerCase().includes(kw)) ||
        (item.getDetail() && item.getDetail().toLowerCase().includes(kw))
      );
    }

    const groupMap = new Map<string, Fashion[]>();
    const standardOrder = ['STREET STYLE', 'TRENDS', 'CELEBRITY STYLE', 'FASHION WEEK', 'RUNWAY'];

    standardOrder.forEach(st => {
      const items = filtered.filter(i => (i.style || '').toUpperCase() === st);
      if (items.length > 0) {
        groupMap.set(st, items);
      }
    });

    filtered.forEach(item => {
      const st = (item.style || 'OTHER STYLE').toUpperCase();
      if (!standardOrder.includes(st)) {
        if (!groupMap.has(st)) {
          groupMap.set(st, []);
        }
        groupMap.get(st)!.push(item);
      }
    });

    const groups: StyleGroup[] = [];
    groupMap.forEach((items, styleName) => {
      groups.push({ styleName, items });
    });

    this.styleGroups.set(groups);
  }

  onSelectCategory(catId: string): void {
    this.selectedDetailFashion.set(null);
    this.applySelectedCategory(catId);
  }

  applySelectedCategory(cat: string): void {
    this.selectedDropdownStyle = cat;
    this.api.setSelectedCategory(cat);

    if (cat === 'ALL') {
      this.searchStyleText = '';
      this.groupFashionsByStyle(this.fashions());
    } else {
      this.searchStyleText = cat;
      this.groupFashionsByStyle(this.fashions(), cat);
    }
  }

  onSearch(): void {
    const query = this.searchStyleText.trim();
    if (!query) {
      this.applySelectedCategory('ALL');
      return;
    }

    const matchedStyle = this.availableStyles().find(
      s => s.toLowerCase() === query.toLowerCase()
    );

    if (matchedStyle) {
      this.applySelectedCategory(matchedStyle);
    } else {
      this.api.setSelectedCategory('SEARCH: ' + query);
      this.groupFashionsByStyle(this.fashions(), undefined, query);
    }
  }

  onDropdownChange(style: string): void {
    this.applySelectedCategory(style);
  }

  selectQuickStyle(style: string): void {
    this.applySelectedCategory(style);
  }

  resetSearch(): void {
    this.applySelectedCategory('ALL');
  }

  viewDetail(fashion: Fashion): void {
    this.selectedDetailFashion.set(fashion);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (fashion.style) {
      const others = this.fashions()
        .filter(i => i._id !== fashion._id && (i.style || '').toUpperCase() === fashion.style.toUpperCase())
        .slice(0, 3);
      this.relatedFashions.set(others);
    }
  }

  goBackToGallery(): void {
    this.selectedDetailFashion.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cleanSnippet(detail: string): string {
    if (!detail) return '';
    const div = document.createElement('div');
    div.innerHTML = detail;
    const text = div.textContent || div.innerText || '';
    return text.length > 120 ? text.substring(0, 120) + '...' : text;
  }
}
