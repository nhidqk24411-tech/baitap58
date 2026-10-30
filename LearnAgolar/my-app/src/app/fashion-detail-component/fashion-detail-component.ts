import { Component, signal } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../service/fashion-apiservice';

@Component({
  selector: 'app-fashion-detail-component',
  standalone: false,
  templateUrl: './fashion-detail-component.html',
  styleUrl: './fashion-detail-component.css',
})
export class FashionDetailComponent {
  fashion=signal<Fashion|null>(null);
  errMessage=signal('')
  constructor(private _service: FashionAPIService){}
  searchFashion(id:string){
    this.fashion.set(null)
    this.errMessage.set("")
    this._service.getFashion(id).subscribe({
      next:(data)=>{
        //restore object model from json
        const fashionInstance = Object.assign(new Fashion(), data);
        this.fashion.set(fashionInstance);        
      },
      error:(err)=>{this.errMessage.set(err)}
    })
  }
}


