import { Injectable } from '@angular/core';
import { Product } from '../classes/IProduct';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  products: Product[] = [
    {id:1, name: 'Iphone', price:999, image:"https://tse3.mm.bing.net/th/id/OIP.wS_v3Vb4KwKHt2VNfJY3GwHaD4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3"},
    {id:2, name: 'Laptop', price:999, image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHh0TO3I7zSpAn5ykUnz6i8ijhl_EhRd7Murapg9zBIw&s"},
    {id:3, name: 'Samsung', price:999, image:"https://th.bing.com/th?id=OIF.v1%2bSkoDnKiNem%2fpRftmurQ&r=0&rs=1&pid=ImgDetMain&o=7&rm=3"},
  ];

  constructor(){}
  getProductList(){
    return this.products
  }
}