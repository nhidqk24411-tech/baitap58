import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Mảng dữ liệu sản phẩm tĩnh theo định dạng JSON
  productsImage = [
    { "ProductId": "p1", "ProductName": "Coca", "Price": 100, "Image": "assets/image1.webp" },
    { "ProductId": "p2", "ProductName": "Pepsi", "Price": 300, "Image": "assets/image2.jpg" },
    { "ProductId": "p3", "ProductName": "Sting", "Price": 200, "Image": "assets/image3.jpg" }
  ];

  constructor() { }

  // Lấy toàn bộ danh sách
  getProductsWithImages() {
    return this.productsImage;
  }

  // Lấy chi tiết 1 sản phẩm theo mã ID
  getProductDetail(id: any) {
    return this.productsImage.find(x => x.ProductId == id);
  }
}