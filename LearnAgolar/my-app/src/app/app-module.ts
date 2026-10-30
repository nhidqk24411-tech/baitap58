import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Contact } from './contact/contact';
import { BindingPropertyComponent } from './binding-property-component/binding-property-component';
import { BindingClassComponent } from './binding-class-component/binding-class-component';
import { BindingStyleComponent } from './binding-style-component/binding-style-component';
import { BindingEventComponent } from './binding-event-component/binding-event-component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BindingTwoWayComponent } from './binding-two-way-component/binding-two-way-component';
import { HomeWork } from './home-work/home-work';
import { ProductListComponent } from './product-list-component/product-list-component';
import { FirstComponent } from './first-component/first-component';
import { ProductDropdownListComponent } from './product-dropdown-list-component/product-dropdown-list-component';
import { ProductListCallServiceComponent } from './product-list-call-service-component/product-list-call-service-component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ProductListCallHttpServiceComponent } from './product-list-call-http-service-component/product-list-call-http-service-component';
import { ProductHttpHandleErrorServiceComponent } from './product-http-handle-error-service-component/product-http-handle-error-service-component';
import { ProductDetailComponent } from './product-detail-component/product-detail-component';
import { ProductListAdvancedComponent } from './product-list-advanced-component/product-list-advanced-component';
import { ProductListSearchComponent } from './product-list-search-component/product-list-search-component';
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
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { WysiwygEditorComponent } from './components/wysiwyg-editor/wysiwyg-editor.component';

@NgModule({
  declarations: [
    App,
    Contact,
    BindingPropertyComponent,
    BindingClassComponent,
    BindingStyleComponent,
    BindingEventComponent,
    BindingTwoWayComponent,
    HomeWork,
    ProductListComponent,
    FirstComponent,
    ProductDropdownListComponent,
    ProductListCallServiceComponent,
    ProductListCallHttpServiceComponent,
    ProductHttpHandleErrorServiceComponent,
    ProductDetailComponent,
    ProductListAdvancedComponent,
    ProductListSearchComponent,
    CourseRegistrationComponent,
    LoginComponent,
    CourseRegistrationReactiveComponent,
    FakeProductComponent,
    FakeProductComponent2,
    BooksComponent,
    BookDetailComponent,
    BookNewComponent,
    BookUpdateComponent,
    BookDeleteComponent,
    FashionComponent,
    FashionDetailComponent,
    SearchFashionComponent,
    FashionNewComponent,
    FashionUpdateComponent,
    FashionDeleteComponent,
    FashionSlugListComponent,
    FashionSlugDetailComponent,
    LoginAuthComponent,
    Bai58FashionClientComponent,
    Bai58FashionAdminComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SafeHtmlPipe,
    WysiwygEditorComponent
  ],
  providers: [provideBrowserGlobalErrorListeners(), provideHttpClient(withInterceptorsFromDi())],
  bootstrap: [App],
})
export class AppModule {}
