import { Component, OnInit, signal } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../service/fashion-apiservice';

export interface FashionSearchResult {
  fashion: Fashion;
  idString: string;
  jaccard: number;
  jaccardPercent: string;
  matchedWords: string[];
  queryWordsCount: number;
  targetWordsCount: number;
  intersectionCount: number;
  unionCount: number;
  colorClass: 'pink' | 'yellow' | 'gray';
  colorLabel: string;
}

@Component({
  selector: 'app-search-fashion',
  standalone: false,
  templateUrl: './search-fashion-component.html',
  styleUrl: './search-fashion-component.css',
})
export class SearchFashionComponent implements OnInit {
  // Toàn bộ danh sách Fashion tải từ database / API
  fashions = signal<Fashion[]>([]);
  // Danh sách kết quả sau khi tính Jaccard và sắp xếp
  searchResults = signal<FashionSearchResult[]>([]);

  // Ô nhập dữ liệu tìm kiếm
  searchQuery = signal<string>('');

  // Tiêu chí tìm kiếm: 'fashion_subject' hoặc 'fashion_detail'
  searchField = signal<'fashion_subject' | 'fashion_detail'>('fashion_subject');

  // Số lượng kết quả hiển thị (5, 10, 15, 20, 0: Tất cả)
  displayLimit = signal<number>(10);

  // Trạng thái lọc: chỉ hiển thị kết quả có Jaccard > 0 hay tất cả
  onlyMatching = signal<boolean>(false);

  // Trạng thái đang tải dữ liệu hoặc lỗi
  isLoading = signal<boolean>(false);
  errMessage = signal<string>('');

  // Modal xem ảnh phóng to
  selectedImage = signal<{ title: string; src: string } | null>(null);

  // Thống kê số lượng kết quả theo nhóm màu
  pinkCount = signal<number>(0);
  yellowCount = signal<number>(0);
  grayCount = signal<number>(0);

  // Các từ khóa gợi ý để kiểm tra nhanh các mức Jaccard
  sampleQueries = [
    { label: 'Paris Fall Shows', query: 'Paris Fall Shows', field: 'fashion_subject' as const },
    { label: 'Street Style Milan', query: 'Street Style Milan', field: 'fashion_subject' as const },
    { label: 'Versace Stars', query: 'Versace Stars', field: 'fashion_subject' as const },
    { label: 'Suits Paul Mescal', query: 'Suits Paul Mescal', field: 'fashion_subject' as const },
    { label: 'Westwood London', query: 'Westwood London', field: 'fashion_subject' as const },
    { label: 'Rick Owens fashion Paris', query: 'Rick Owens fashion Paris coatless', field: 'fashion_detail' as const },
  ];

  constructor(private fashionService: FashionAPIService) {}

  ngOnInit(): void {
    this.loadFashions();
  }

  // Tải dữ liệu Fashion
  loadFashions(): void {
    this.isLoading.set(true);
    this.errMessage.set('');
    this.fashionService.getFashions().subscribe({
      next: (data: any[]) => {
        // Chuẩn hóa dữ liệu sang instance Fashion
        const validList: Fashion[] = (data || []).map((item) => {
          const f = new Fashion(
            item._id,
            item.style || 'N/A',
            item.fashion_subject || '',
            item.fashion_detail || '',
            item.fashion_image || ''
          );
          return f;
        });
        this.fashions.set(validList);
        this.isLoading.set(false);
        // Khởi tạo hiển thị ban đầu
        this.executeSearch();
      },
      error: (err) => {
        this.errMessage.set('Lỗi khi tải dữ liệu từ máy chủ: ' + (err.message || err));
        this.isLoading.set(false);
      },
    });
  }

  // Chuẩn hóa chuỗi văn bản thành tập hợp các từ (Set of words)
  tokenize(text: string): Set<string> {
    if (!text) return new Set<string>();
    // Chuẩn hóa chữ thường, loại bỏ ký tự đặc biệt / dấu câu, tách theo khoảng trắng
    const words = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    return new Set(words);
  }

  // Thuật toán tính chỉ số tương đồng Jaccard Similarity: J(A, B) = |A ∩ B| / |A ∪ B|
  calculateJaccard(queryText: string, targetText: string): {
    jaccard: number;
    matchedWords: string[];
    queryCount: number;
    targetCount: number;
    intersectionCount: number;
    unionCount: number;
  } {
    const setA = this.tokenize(queryText);
    const setB = this.tokenize(targetText);

    if (setA.size === 0 || setB.size === 0) {
      return {
        jaccard: 0,
        matchedWords: [],
        queryCount: setA.size,
        targetCount: setB.size,
        intersectionCount: 0,
        unionCount: setA.size + setB.size,
      };
    }

    const matchedWords: string[] = [];
    for (const word of setA) {
      if (setB.has(word)) {
        matchedWords.push(word);
      }
    }

    const intersectionCount = matchedWords.length;
    const unionCount = setA.size + setB.size - intersectionCount;
    const jaccard = unionCount > 0 ? intersectionCount / unionCount : 0;

    return {
      jaccard,
      matchedWords,
      queryCount: setA.size,
      targetCount: setB.size,
      intersectionCount,
      unionCount,
    };
  }

  // Thực hiện tìm kiếm và sắp xếp kết quả
  executeSearch(): void {
    const query = this.searchQuery().trim();
    const field = this.searchField();
    const rawList = this.fashions();

    const evaluatedResults: FashionSearchResult[] = rawList.map((item) => {
      const targetText = field === 'fashion_subject' ? (item.fashion_subject || '') : (item.fashion_detail || '');
      const calc = this.calculateJaccard(query, targetText);

      // Phân loại nhóm màu theo yêu cầu:
      // Jaccard [0.75 -> 1.0] tô nền hồng
      // Jaccard [0.5 -> 0.75] tô nền vàng
      // Dưới < 0.5 tô nền xám
      let colorClass: 'pink' | 'yellow' | 'gray';
      let colorLabel: string;

      if (calc.jaccard >= 0.75) {
        colorClass = 'pink';
        colorLabel = 'Rất cao (≥ 0.75)';
      } else if (calc.jaccard >= 0.5) {
        colorClass = 'yellow';
        colorLabel = 'Trung bình [0.5 - 0.75)';
      } else {
        colorClass = 'gray';
        colorLabel = 'Thấp (< 0.5)';
      }

      return {
        fashion: item,
        idString: this.formatId(item._id),
        jaccard: calc.jaccard,
        jaccardPercent: (calc.jaccard * 100).toFixed(1) + '%',
        matchedWords: calc.matchedWords,
        queryWordsCount: calc.queryCount,
        targetWordsCount: calc.targetCount,
        intersectionCount: calc.intersectionCount,
        unionCount: calc.unionCount,
        colorClass,
        colorLabel,
      };
    });

    // SẮP XẾP GIẢM DẦN THEO JACCARD SIMILARITY (yêu cầu)
    evaluatedResults.sort((a, b) => b.jaccard - a.jaccard);

    // Lọc chỉ hiện các dòng có Jaccard > 0 nếu người dùng bật tùy chọn
    let filtered = evaluatedResults;
    if (this.onlyMatching() && query.length > 0) {
      filtered = filtered.filter((r) => r.jaccard > 0);
    }

    // Đếm số lượng theo nhóm màu
    let pink = 0;
    let yellow = 0;
    let gray = 0;
    filtered.forEach((r) => {
      if (r.colorClass === 'pink') pink++;
      else if (r.colorClass === 'yellow') yellow++;
      else gray++;
    });
    this.pinkCount.set(pink);
    this.yellowCount.set(yellow);
    this.grayCount.set(gray);

    // Áp dụng giới hạn số lượng kết quả hiển thị (displayLimit)
    const limit = this.displayLimit();
    if (limit > 0 && filtered.length > limit) {
      filtered = filtered.slice(0, limit);
    }

    this.searchResults.set(filtered);
  }

  // Chuyển đổi ID sang chuỗi hiển thị
  formatId(id: any): string {
    if (!id) return 'N/A';
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id.$oid) return id.$oid;
    return JSON.stringify(id);
  }

  // Lấy đường dẫn ảnh hợp lệ (hỗ trợ Base64 và URL)
  getImageSrc(image: string): string {
    if (!image) {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="%23e2e8f0" width="100" height="100"/><text fill="%2394a3b8" font-family="sans-serif" font-size="12" dy="5" font-weight="bold" x="50%" y="50%" text-anchor="middle">No Image</text></svg>';
    }
    if (image.startsWith('data:image') || image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    return 'data:image/jpeg;base64,' + image;
  }

  // Chọn từ gợi ý
  applySampleQuery(sample: { query: string; field: 'fashion_subject' | 'fashion_detail' }): void {
    this.searchQuery.set(sample.query);
    this.searchField.set(sample.field);
    this.executeSearch();
  }

  // Thay đổi tiêu chí tìm kiếm
  onFieldChange(field: 'fashion_subject' | 'fashion_detail'): void {
    this.searchField.set(field);
    this.executeSearch();
  }

  // Thay đổi số lượng kết quả
  onLimitChange(limit: number): void {
    this.displayLimit.set(limit);
    this.executeSearch();
  }

  // Xóa nội dung tìm kiếm
  clearSearch(): void {
    this.searchQuery.set('');
    this.executeSearch();
  }

  // Mở modal phóng to ảnh
  openImageModal(fashion: Fashion): void {
    this.selectedImage.set({
      title: fashion.fashion_subject || fashion.style || 'Fashion Image',
      src: this.getImageSrc(fashion.fashion_image),
    });
  }

  // Đóng modal ảnh
  closeImageModal(): void {
    this.selectedImage.set(null);
  }
}
