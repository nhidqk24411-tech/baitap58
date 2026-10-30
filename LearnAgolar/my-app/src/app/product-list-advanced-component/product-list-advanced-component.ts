import { Component, signal } from '@angular/core';
import { Product } from '../classes/IProduct';
import { ProductHttpHandleErrorService } from '../service/product-http-handle-error-service';
import { Router } from '@angular/router';
import { createSlug } from '../classes/SlugHelper';

@Component({
  selector: 'app-product-list-advanced-component',
  standalone: false,
  styleUrl: './product-list-advanced-component.css',
  templateUrl: './product-list-advanced-component.html',
})
export class ProductListAdvancedComponent {
  products = signal<Product[]>([]);
  errMessage = signal('');
  public generateSlug = createSlug;

  constructor(
    private _service: ProductHttpHandleErrorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this._service.getProductList().subscribe({
      next: (data) => {
        this.products.set(data);
      },
      error: (err) => {
        this.errMessage.set(err instanceof Error ? err.message : String(err));
      },
    });
  }

  viewDetailSlug(p: Product) {
    const slug = this.generateSlug(p.name, p.id);
    this.router.navigate(['/product', slug]);
  }
}
