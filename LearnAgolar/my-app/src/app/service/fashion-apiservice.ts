import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { Fashion } from '../classes/Fashion';

@Injectable({
  providedIn: 'root',
})
export class FashionAPIService {
  private apiUrl = '/fashions';

  headers = new HttpHeaders().set('Content-Type', 'application/json;charset=utf-8');
  requestOptions: Object = {
    headers: this.headers,
    responseType: 'text'
  };

  selectedCategory = signal<string>('ALL');

  constructor(private _http: HttpClient) {}

  setSelectedCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  getFashions(style?: string): Observable<Fashion[]> {
    let url = this.apiUrl;
    if (style && style !== 'ALL') {
      url += `?style=${encodeURIComponent(style)}`;
    }
    return this._http.get<any>(url, this.requestOptions).pipe(
      map(res => {
        const raw = typeof res === 'string' ? JSON.parse(res) : res;
        return (raw as any[]).map(item => new Fashion(
          item._id,
          item.style,
          item.fashion_subject || item.title,
          item.fashion_detail !== undefined ? item.fashion_detail : item.detail,
          item.fashion_image || item.thumbnail,
          item.title || item.fashion_subject,
          item.detail !== undefined ? item.detail : item.fashion_detail,
          item.thumbnail || item.fashion_image,
          item.created_at,
          item.IdF,
          item.slug
        ));
      }),
      retry(2),
      catchError(this.handleError)
    );
  }

  getFashion(id: string): Observable<Fashion> {
    return this._http.get<any>(`${this.apiUrl}/${id}`, this.requestOptions).pipe(
      map(res => {
        const item = typeof res === 'string' ? JSON.parse(res) : res;
        return new Fashion(
          item._id,
          item.style,
          item.fashion_subject || item.title,
          item.fashion_detail !== undefined ? item.fashion_detail : item.detail,
          item.fashion_image || item.thumbnail,
          item.title || item.fashion_subject,
          item.detail !== undefined ? item.detail : item.fashion_detail,
          item.thumbnail || item.fashion_image,
          item.created_at,
          item.IdF,
          item.slug
        );
      }),
      retry(2),
      catchError(this.handleError)
    );
  }

  getFashionBySlug(slug: string): Observable<Fashion> {
    const cleanSlug = (slug || '').trim();
    const parsed = Fashion.parseSlug(cleanSlug);

    return this._http.get<any>(`${this.apiUrl}/slug/${encodeURIComponent(cleanSlug)}`, this.requestOptions).pipe(
      map(res => {
        const item = typeof res === 'string' ? JSON.parse(res) : res;
        return new Fashion(
          item._id,
          item.style,
          item.fashion_subject || item.title,
          item.fashion_detail !== undefined ? item.fashion_detail : item.detail,
          item.fashion_image || item.thumbnail,
          item.title || item.fashion_subject,
          item.detail !== undefined ? item.detail : item.fashion_detail,
          item.thumbnail || item.fashion_image,
          item.created_at,
          item.IdF,
          item.slug
        );
      }),
      catchError(() => {
        return this.getFashions().pipe(
          map(list => {
            let found = list.find(i => i.slug?.toLowerCase() === cleanSlug.toLowerCase());
            if (!found && parsed.idf !== null) {
              found = list.find(i => i.IdF === parsed.idf);
            }
            if (!found && parsed.baseSlug) {
              found = list.find(i => {
                const itemParsed = Fashion.parseSlug(i.slug || '');
                return itemParsed.baseSlug === parsed.baseSlug;
              });
            }
            if (!found) {
              throw new Error(`Không tìm thấy bài viết Fashion với slug: "${slug}"`);
            }
            return found;
          })
        );
      }),
      catchError(this.handleError)
    );
  }

  getStyles(): Observable<string[]> {
    return this._http.get<any>(`${this.apiUrl}/styles`, this.requestOptions).pipe(
      map(res => {
        const list = typeof res === 'string' ? JSON.parse(res) : res;
        return Array.isArray(list) ? list : [];
      }),
      catchError(() => this.getFashions().pipe(
        map(items => Array.from(new Set(items.map(i => i.style).filter(Boolean))))
      ))
    );
  }

  getFashionsByStyle(style: string): Observable<Fashion[]> {
    return this.getFashions(style);
  }

  postFashion(aFashion: any): Observable<any> {
    const payload = {
      title: aFashion.fashion_subject || aFashion.title,
      fashion_subject: aFashion.fashion_subject || aFashion.title,
      detail: aFashion.fashion_detail !== undefined ? aFashion.fashion_detail : aFashion.detail,
      fashion_detail: aFashion.fashion_detail !== undefined ? aFashion.fashion_detail : aFashion.detail,
      thumbnail: aFashion.fashion_image || aFashion.thumbnail,
      fashion_image: aFashion.fashion_image || aFashion.thumbnail,
      style: aFashion.style || 'STREET STYLE'
    };
    const jsonString = JSON.stringify(payload);
    return this._http.post<any>(this.apiUrl, jsonString, this.requestOptions).pipe(
      map(res => typeof res === 'string' ? JSON.parse(res) : res),
      catchError(this.handleError)
    );
  }

  putFashion(aFashion: any): Observable<any> {
    const payload = {
      _id: aFashion._id,
      title: aFashion.fashion_subject || aFashion.title,
      fashion_subject: aFashion.fashion_subject || aFashion.title,
      detail: aFashion.fashion_detail !== undefined ? aFashion.fashion_detail : aFashion.detail,
      fashion_detail: aFashion.fashion_detail !== undefined ? aFashion.fashion_detail : aFashion.detail,
      thumbnail: aFashion.fashion_image || aFashion.thumbnail,
      fashion_image: aFashion.fashion_image || aFashion.thumbnail,
      style: aFashion.style || 'STREET STYLE'
    };
    const jsonString = JSON.stringify(payload);
    return this._http.put<any>(this.apiUrl, jsonString, this.requestOptions).pipe(
      map(res => typeof res === 'string' ? JSON.parse(res) : res),
      catchError(this.handleError)
    );
  }

  deleteFashion(fashionId: string): Observable<any> {
    return this._http.delete<any>(`${this.apiUrl}/${fashionId}`, this.requestOptions).pipe(
      map(res => typeof res === 'string' ? JSON.parse(res) : res),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message || 'Lỗi kết nối máy chủ REST API Fashion'));
  }
}
