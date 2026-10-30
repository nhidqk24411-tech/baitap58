import { Component, OnInit } from '@angular/core';
import { CatalogService } from '../catalog'; // Chỉnh đường dẫn nếu lưu trong services/catalog.service

@Component({
  selector: 'app-catalog',
  standalone: false,
  templateUrl: './catalog.html',
  styleUrls: ['./catalog.css']
})
export class CatalogComponent implements OnInit {
  public catalogs: any[] = [];

  // Tiêm CatalogService thông qua DI Constructor
  constructor(private catalogService: CatalogService) { }

  ngOnInit(): void {
    // Gọi phương thức lấy danh sách danh mục và gán vào biến catalogs
    this.catalogs = this.catalogService.getCategories();
  }
}