import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FashionSlug } from '../fashion-slug.model';
import { FashionSlugApiService } from '../fashion-slug-api.service';

@Component({
  selector: 'app-fashion-slug-detail',
  standalone: false,
  templateUrl: './fashion-slug-detail.component.html',
  styleUrl: './fashion-slug-detail.component.css',
})
export class FashionSlugDetailComponent implements OnInit {
  fashion = signal<FashionSlug | null>(null);
  isLoading = signal<boolean>(true);
  errMessage = signal<string>('');
  currentSlug = signal<string>('');
  isCopied = signal<boolean>(false);
  parsedSlugInfo = signal<{ idf: number | null; baseSlug: string }>({ idf: null, baseSlug: '' });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fashionSlugService: FashionSlugApiService
  ) {}

  ngOnInit(): void {
    // Lắng nghe thay đổi tham số :slug từ URL
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.currentSlug.set(slug);
        // Tự động phân tích cấu trúc của Slug để nhận diện IdF và tiêu đề
        const parsed = FashionSlug.parseSlug(slug);
        this.parsedSlugInfo.set(parsed);
        this.loadDetail(slug);
      } else {
        this.errMessage.set('Tham số slug không hợp lệ.');
        this.isLoading.set(false);
      }
    });
  }

  loadDetail(slug: string): void {
    this.isLoading.set(true);
    this.errMessage.set('');

    this.fashionSlugService.getFashionSlugDetail(slug).subscribe({
      next: data => {
        this.fashion.set(data);
        this.isLoading.set(false);
      },
      error: err => {
        this.errMessage.set(err.message || `Không thể tải dữ liệu cho slug "${slug}"`);
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/fashion-slug-list']);
  }

  copySlugLink(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2500);
    });
  }
}
