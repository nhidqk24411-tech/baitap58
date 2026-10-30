import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductListComponent } from './product-list-component/product-list-component';
import { ProductDropdownListComponent } from './product-dropdown-list-component/product-dropdown-list-component';
import { ProductListCallServiceComponent } from './product-list-call-service-component/product-list-call-service-component';
import { ProductListCallHttpServiceComponent } from './product-list-call-http-service-component/product-list-call-http-service-component';
import { ProductHttpHandleErrorServiceComponent } from './product-http-handle-error-service-component/product-http-handle-error-service-component';
import { ProductDetailComponent } from './product-detail-component/product-detail-component';
import { ProductListAdvancedComponent } from './product-list-advanced-component/product-list-advanced-component';
import { ProductListSearchComponent } from './product-list-search-component/product-list-search-component';
import { Contact } from './contact/contact';
import { authGuard } from './classes/auth.guard';
import { CourseRegistrationComponent } from './course-registration-component/course-registration-component';
import { LoginComponent } from './login-component/login-component';
import { CourseRegistrationReactiveComponent } from './course-registration-reactive-component/course-registration-reactive-component';
import { FakeProductComponent } from './fake-product-component/fake-product-component';
import { FakeProductComponent2 } from './fake-product-component-2/fake-product-component-2';
import { BooksComponent } from './books-component/books-component';
import { BookDetailComponent } from './book-detail-component/book-detail-component';
import { BookNewComponent } from './book-new-component/book-new-component';
import { BookUpdateComponent } from './book-update-component/book-update-component';
import { BookDeleteComponent } from './book-delete-component/book-delete-component';
import { FashionComponent } from './fashion-component/fashion-component';
import { FashionDetailComponent } from './fashion-detail-component/fashion-detail-component';
import { SearchFashionComponent } from './search-fashion-component/search-fashion-component';
import { FashionNewComponent } from './fashion-new-component/fashion-new-component';
import { FashionUpdateComponent } from './fashion-update-component/fashion-update-component';
import { FashionDeleteComponent } from './fashion-delete-component/fashion-delete-component';
import { FashionSlugListComponent } from './home-work/fashion-slug/fashion-slug-list/fashion-slug-list.component';
import { FashionSlugDetailComponent } from './home-work/fashion-slug/fashion-slug-detail/fashion-slug-detail.component';
import { LoginAuthComponent } from './login-auth-component/login-auth-component';
import { Bai58FashionClientComponent } from './bai58-fashion-client/bai58-fashion-client.component';
import { Bai58FashionAdminComponent } from './bai58-fashion-admin/bai58-fashion-admin.component';

const routes: Routes = [
  {path:"learn-directive", component:ProductListComponent},
  {path:"contacts", component:ProductDropdownListComponent},
  {path:"product-list-call-service", component:ProductListCallServiceComponent},
  {path:"product-list-call-http-service", component:ProductListCallHttpServiceComponent},
  {path:"product-list-call-http-handle-error-service", component:ProductHttpHandleErrorServiceComponent},
  {path:"product/:id", component:ProductDetailComponent},
  {path:"product",component:ProductListAdvancedComponent},
  {path: "search-product", component: ProductListSearchComponent},
  {path:"",component:Contact},
  {path:"login",component:LoginComponent},
  {
    path:"sample-nested", component:ProductListAdvancedComponent,
    children: [
      {path:"search-child",component:ProductListSearchComponent},
      {path:"detail/:id",component:ProductDetailComponent}
    ]
  },
  {
    path: 'lazyinfo',
    loadComponent: () =>
      import('./lazy-component/lazy-component')
      .then(c => c.LazyComponent),
      canActivate: [authGuard]
  },
  {path:'course-register', component:CourseRegistrationComponent},
  {path:'course-reactive-register', component:CourseRegistrationReactiveComponent},  
  {path:'contracts',component:Contact},
  {path:'fakeproduct',component:FakeProductComponent},
  {path:'fakeproduct2', component: FakeProductComponent2},
  {path:'book-list', component: BooksComponent},
  {path:'book-detail', component: BookDetailComponent},
  {path:'book-new', component: BookNewComponent},
  {path:'book-update', component: BookUpdateComponent},
  {path:'book-delete', component: BookDeleteComponent},
  {path:'fashion-list', component: FashionComponent},
  {path:'fashion-detail', component: FashionDetailComponent},
  {path:'search-fashion', component: SearchFashionComponent},
  {path:'fashion-search', component: SearchFashionComponent},
  {path:'fashion-new', component: FashionNewComponent},
  {path:'fashion-update', component: FashionUpdateComponent},
  {path:'fashion-delete', component: FashionDeleteComponent},
  {path:'fashion-slug-list', component: FashionSlugListComponent},
  {path:'fashion-slug-detail/:slug', component: FashionSlugDetailComponent},
  {path:'login-auth', component: LoginAuthComponent},
  {path:'login',component:LoginComponent},
  {path:'bai58-fashion-client', component: Bai58FashionClientComponent},
  {path:'bai58-fashion-admin', component: Bai58FashionAdminComponent},
  {path:'bai58-fashion', component: Bai58FashionClientComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
