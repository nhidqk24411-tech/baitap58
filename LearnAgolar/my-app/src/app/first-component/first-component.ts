import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-child',
  standalone: false,
  templateUrl: './first-component.html',
  styleUrl: './first-component.css',
})
export class FirstComponent {
  @Input() receivedData: string = '';

  @Output() notifyParent = new EventEmitter<string>();
  sendToParent() {
  this.notifyParent.emit('Hello from Child B');
}
}