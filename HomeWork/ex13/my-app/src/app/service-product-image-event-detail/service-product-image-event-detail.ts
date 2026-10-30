import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product';

@Component({
  selector: 'app-service-product-image-event-detail',
  standalone: false,
  templateUrl: './service-product-image-event-detail.html',
  styleUrls: ['./service-product-image-event-detail.css']
})
export class ServiceProductImageEventDetailComponent {
  selectedProduct: any;

  constructor(
    private activateRoute: ActivatedRoute,
    private _fs: ProductService,
    private router: Router
  ) {
    // Đăng ký nhận tham số :id từ URL
    this.activateRoute.paramMap.subscribe((param) => {
      let id = param.get('id');
      if (id != null) {
        this.selectedProduct = this._fs.getProductDetail(id);
      }
    });
  }

  // Điều hướng trở lại trang danh sách
  goBack() {
    this.router.navigate(['service-product-image-event']);
  }
}