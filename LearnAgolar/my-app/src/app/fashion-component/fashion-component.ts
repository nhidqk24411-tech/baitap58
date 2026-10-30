import { Component, signal } from '@angular/core';
import { FashionAPIService } from '../service/fashion-apiservice';
import { Fashion } from '../classes/Fashion';

@Component({
  selector: 'app-fashion-component',
  standalone: false,
  templateUrl: './fashion-component.html',
  styleUrl: './fashion-component.css',
})
export class FashionComponent {
  fashions=signal<Fashion[]>([]);
  errMessage=signal('')
  constructor(public _service: FashionAPIService){
    this._service.getFashions().subscribe({
      next:(data)=>{this.fashions.set(data)},
      error:(err)=>{this.errMessage.set(err)}
    })
  }
}


