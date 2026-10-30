import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, retry, switchMap, throwError } from 'rxjs';
import { FashionSlug } from './fashion-slug.model';

@Injectable({
  providedIn: 'root',
})
export class FashionSlugApiService {
  private readonly proxyUrl = '/fashions';

  // Cấu hình headers và requestOptions chuẩn theo quy ước dự án
  headers = new HttpHeaders().set('Content-Type', 'application/json;charset=utf-8');
  requestOptions: Object = {
    headers: this.headers,
    responseType: 'text',
  };

  constructor(private http: HttpClient) {}

  /**
   * Helper an toàn: Chuyển đổi dữ liệu trả về từ máy chủ (chuỗi JSON hoặc Object) thành danh sách mảng
   */
  private extractList(res: any): any[] {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (typeof res === 'string') {
      const trimmed = res.trim();
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          return [];
        }
      }
    }
    return [];
  }

  /**
   * Helper an toàn: Chuyển đổi dữ liệu trả về từ máy chủ thành một đối tượng Fashion đơn lẻ
   */
  private extractItem(res: any): any {
    if (!res) return null;
    if (typeof res === 'object' && !Array.isArray(res)) return res;
    if (typeof res === 'string') {
      const trimmed = res.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          return Array.isArray(parsed) ? parsed[0] : parsed;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Lấy danh sách toàn bộ thời trang dạng FashionSlug
   */
  getFashionSlugList(): Observable<FashionSlug[]> {
    return this.http.get<any>(this.proxyUrl, this.requestOptions).pipe(
      map(res => this.extractList(res)),
      map((dataList: any[]) => {
        return dataList.map((item, index) => FashionSlug.fromJson(item, index + 1));
      }),
      retry(2),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Lấy chi tiết thời trang theo slug (chuẩn SEO)
   * Hệ thống tự động phân tích (parse) slug để trích xuất IdF và baseSlug,
   * sau đó truy vấn và hiển thị chính xác Fashion Detail mong muốn.
   */
  getFashionSlugDetail(slug: string): Observable<FashionSlug> {
    const cleanSlug = (slug || '').trim().toLowerCase();
    const parsed = FashionSlug.parseSlug(cleanSlug);

    // Bước 1: Luôn phân tích và đối chiếu từ danh sách thời trang để đảm bảo 100% khớp chính xác
    return this.getFashionSlugList().pipe(
      switchMap(list => {
        // 1. Khớp chính xác chuỗi slug
        let found = list.find(item => item.slug.toLowerCase() === cleanSlug);

        // 2. Khớp theo mã số IdF duy nhất trích xuất được từ slug
        if (!found && parsed.idf !== null) {
          found = list.find(item => item.IdF === parsed.idf);
        }

        // 3. Khớp theo baseSlug không dấu
        if (!found && parsed.baseSlug) {
          found = list.find(item => {
            const itemParsed = FashionSlug.parseSlug(item.slug);
            return itemParsed.baseSlug === parsed.baseSlug;
          });
        }

        if (found) {
          return of(found);
        }

        // Bước 2: Nếu chưa tìm thấy trong danh sách nạp sẵn, thử truy vấn endpoint slug của backend
        const endpoint = `${this.proxyUrl}/slug/${encodeURIComponent(cleanSlug)}`;
        return this.http.get<any>(endpoint, this.requestOptions).pipe(
          map(res => {
            const rawItem = this.extractItem(res);
            if (!rawItem) {
              throw new Error(`Không tìm thấy mẫu thời trang với slug: "${slug}"`);
            }
            return FashionSlug.fromJson(rawItem, parsed.idf || 1);
          })
        );
      }),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Lấy chi tiết thời trang theo _id MongoDB
   */
  getFashionById(id: string): Observable<FashionSlug> {
    return this.http.get<any>(`${this.proxyUrl}/${id}`, this.requestOptions).pipe(
      map(res => {
        const item = this.extractItem(res);
        return FashionSlug.fromJson(item, 1);
      }),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Thêm mới một sản phẩm thời trang
   */
  postFashion(fashion: FashionSlug): Observable<FashionSlug> {
    const payload = JSON.stringify({
      IdF: fashion.IdF,
      fashion_subject: fashion.fashion_subject,
      title: fashion.fashion_subject,
      style: fashion.style,
      fashion_detail: fashion.fashion_detail,
      detail: fashion.fashion_detail,
      fashion_image: fashion.fashion_image,
      thumbnail: fashion.fashion_image,
      slug: fashion.slug || FashionSlug.createSlug(fashion.fashion_subject, fashion.IdF),
    });

    return this.http.post<any>(this.proxyUrl, payload, this.requestOptions).pipe(
      map(res => {
        const item = this.extractItem(res);
        return FashionSlug.fromJson(item, fashion.IdF);
      }),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Cập nhật thông tin sản phẩm thời trang
   */
  putFashion(fashion: FashionSlug): Observable<FashionSlug> {
    const payload = JSON.stringify({
      _id: fashion._id,
      IdF: fashion.IdF,
      fashion_subject: fashion.fashion_subject,
      title: fashion.fashion_subject,
      style: fashion.style,
      fashion_detail: fashion.fashion_detail,
      detail: fashion.fashion_detail,
      fashion_image: fashion.fashion_image,
      thumbnail: fashion.fashion_image,
      slug: fashion.slug || FashionSlug.createSlug(fashion.fashion_subject, fashion.IdF),
    });

    const targetUrl = fashion._id ? `${this.proxyUrl}/${fashion._id}` : this.proxyUrl;
    return this.http.put<any>(targetUrl, payload, this.requestOptions).pipe(
      map(res => {
        const item = this.extractItem(res);
        return FashionSlug.fromJson(item, fashion.IdF);
      }),
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Xóa sản phẩm thời trang theo _id
   */
  deleteFashion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.proxyUrl}/${id}`, this.requestOptions).pipe(
      catchError(err => this.handleError(err))
    );
  }

  /**
   * Xử lý lỗi HTTP thân thiện (Arrow function để luôn giữ đúng ngữ cảnh this)
   */
  handleError = (error: HttpErrorResponse | any): Observable<never> => {
    let msg = 'Đã có lỗi xảy ra khi kết nối máy chủ.';
    if (error instanceof Error) {
      msg = error.message;
    } else if (error?.error instanceof ErrorEvent) {
      msg = `Lỗi ứng dụng: ${error.error.message}`;
    } else if (error?.error && typeof error.error === 'object' && error.error.error) {
      msg = error.error.error;
    } else if (error?.message) {
      msg = error.message;
    }
    return throwError(() => new Error(msg));
  };
}
