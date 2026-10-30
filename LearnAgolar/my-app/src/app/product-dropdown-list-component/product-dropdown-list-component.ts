import { Component } from '@angular/core';
import { Product } from '../classes/IProduct';

@Component({
  selector: 'app-product-dropdown-list-component',
  standalone: false,
  styleUrl: './product-dropdown-list-component.css',
  templateUrl: './product-dropdown-list-component.html',
})
export class ProductDropdownListComponent {
  products: Product[] = [
    {id:1, name: 'Iphone', price:999, image:"data:image/svg+xml;charset=utf-8,%3Csvg xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg' viewBox%3D'0 0 1074 1910'%3E%3Crect x='0' y='0' width='100%' height='100%' style='fill:rgb(241, 245, 249)' %2F%3E%3C%2Fsvg%3E"},
    {id:2, name: 'Laptop', price:999, image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHh0TO3I7zSpAn5ykUnz6i8ijhl_EhRd7Murapg9zBIw&s"},
    {id:3, name: 'Samsung', price:999, image:"https://www.thegioididong.com/dtdd-samsung"},
  ];
}
