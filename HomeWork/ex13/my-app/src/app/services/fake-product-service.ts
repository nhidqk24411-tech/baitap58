import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, retry, throwError } from 'rxjs';
import { IFakeProduct } from '../classes/IFakeProduct';

@Injectable({
  providedIn: 'root',
})
export class FakeProductService {
  private _url: string = "/products"; // Đường dẫn tương đối phục vụ cho cấu hình proxy

  constructor(private _http: HttpClient) {}

  getFakeProductData(): Observable<any> {
    const headers = new HttpHeaders().set("Content-Type", "text/plain;charset=utf-8");
    const requestOptions: Object = {
      headers: headers,
      responseType: "text"
    };

    return this._http.get<any>(this._url, requestOptions).pipe(
      map(res => JSON.parse(res) as Array<IFakeProduct>),
      retry(3),
      catchError(this.handleError)
    );
  }

  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error(error.message));
  }
}