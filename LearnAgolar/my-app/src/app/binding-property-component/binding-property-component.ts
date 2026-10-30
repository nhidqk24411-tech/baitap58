import { Component } from '@angular/core';

@Component({
  selector: 'app-binding-property-component',
  standalone: false,
  styleUrl: './binding-property-component.css',
  templateUrl: './binding-property-component.html',
})
export class BindingPropertyComponent {
  public name: string ="Nhi"
  public email:string ="nhidqk24411@gmail.com"
  public nameid: string ="N"
  public emailid: string ="E"
  public isDisabled: boolean = true
  public hello: string = "Hello!!!!"
}
