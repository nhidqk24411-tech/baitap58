import { Component, signal } from '@angular/core';
import { BookAPIService } from '../service/book-apiservice';
import { IBook } from '../classes/Book';

@Component({
  selector: 'app-book-detail-component',
  standalone: false,
  templateUrl: './book-detail-component.html',
  styleUrl: './book-detail-component.css',
})
export class BookDetailComponent {
  book=signal<IBook|null>(null);
  errMessage=signal('')
  server_images_link="http://localhost:3000/"
  constructor(private _service: BookAPIService){
  }
  searchBook(bookId:string)
  {
    this.book.set(null)
    this.errMessage.set("")
    this._service.getBook(bookId).subscribe({
      next:(data)=>{this.book.set(data)},
      error:(err)=>{this.errMessage.set(err)}
    })
  }
}


