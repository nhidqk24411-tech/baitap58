import { Component } from '@angular/core';
import { Fashion } from '../classes/Fashion';
import { FashionAPIService } from '../service/fashion-apiservice';

@Component({
  selector: 'app-fashion-update-component',
  standalone: false,
  templateUrl: './fashion-update-component.html',
  styleUrl: './fashion-update-component.css',
})
export class FashionUpdateComponent {
  fashion=new Fashion();
  errMessage:string=''
  constructor(private _service: FashionAPIService){
  }
  onFileSelected(event:any,fashion:Fashion) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      fashion.fashion_image=reader.result!.toString()
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }
  putFashion()
  {
    this._service.putFashion(this.fashion).subscribe({
      next:(data)=>{this.fashion=data},
      error:(err)=>{this.errMessage=err}
    })
  }
}


