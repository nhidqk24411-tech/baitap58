import { Component } from '@angular/core';

@Component({
  selector: 'app-binding-class-component',
  standalone: false,
  styleUrl: './binding-class-component.css',
  templateUrl: './binding-class-component.html',
})
export class BindingClassComponent {
  // Logic state
  isSaved: boolean = false;
  isActive: boolean = true;

  // Event handler method
  toggleSaveState() {
    this.isSaved = !this.isSaved;
  }
}
