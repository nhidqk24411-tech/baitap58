import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Product } from '../classes/IProduct';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ProductHttpService {
    private _url: string="datasets/products.json"
    constructor(private _http: HttpClient) {

    }
    getProductList() :Observable<Product[]>{
        return this._http.get<Product[]>(this._url);
    }
    getProductById(id: number): Observable<Product | undefined> {
    return this.getProductList().pipe(
        map((products: Product[]) => products.find(p => p.id === id)),
        catchError(this.handleError)
    );
    }
    handleError(error:HttpErrorResponse)
    {
        return throwError(()=>new Error(error.message))
    }
}
