import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, throwError } from 'rxjs';
import { IFakeProduct } from '../classes/IFakeProduct';

@Injectable({
  providedIn: 'root',
})
export class FakeProductService {
  private readonly _url = 'https://fakestoreapi.com/products';

  constructor(private _http: HttpClient) {}

  getFakeProductData(): Observable<IFakeProduct[]> {
    return this._http.get<IFakeProduct[]>(this._url).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}


