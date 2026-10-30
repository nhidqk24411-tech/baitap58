import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../product';

@Component({
  selector: 'app-service-product-image-event',
  standalone: false,
  templateUrl: './service-product-image-event.html',
  styleUrls: ['./service-product-image-event.css']
})
export class ServiceProductImageEventComponent {
  public products: any;

  // Tiêm ProductService và Router vào constructor
  constructor(pservice: ProductService, private router: Router) {
    this.products = pservice.getProductsWithImages();
  }

  // Chuyển hướng router sang URL kèm ProductId
  viewDetail(f: any) {
    this.router.navigate(['service-product-image-event', f.ProductId]);
  }
}