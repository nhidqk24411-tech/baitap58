import { Component, signal } from '@angular/core';
import { FakeProductService } from '../service/fake-product-service';
import { IFakeProduct } from '../classes/IFakeProduct';

@Component({
  selector: 'app-fake-product-component',
  standalone: false,
  templateUrl: './fake-product-component.html',
  styleUrl: './fake-product-component.css',
})
export class FakeProductComponent {
  products=signal<IFakeProduct[]>([])
  errMessage=signal('')
  constructor(private _service:FakeProductService){
  }
  ngOnInit():void
  {
    this._service.getFakeProductData().subscribe({
      next:(data)=>{ this.products.set(data)},
      error:(err)=>{
        this.errMessage.set(err)
      }
    })
  }
}


