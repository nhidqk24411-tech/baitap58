import { Component } from '@angular/core';
import { Product } from '../classes/IProduct';
import { ProductService } from '../service/product-service';
@Component({
  selector: 'app-product-list-call-service-component',
  standalone: false,
  styleUrl: './product-list-call-service-component.css',
  templateUrl: './product-list-call-service-component.html',
})
export class ProductListCallServiceComponent {
  minPrice:number=0
  maxPrice:number=90000
  products: Product[] = []
  constructor(private ps:ProductService) {
    //this.products=this.ps.getProducts();
  }
  ngOnInit():void
  {
    this.products=this.ps.getProductList();
  }
  doFilterByPrice()
  {
    this.products=this.ps.getProductList().filter(p => p.price >= this.minPrice && p.price <= this.maxPrice)
  }
}