import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('my-app');
  messageFromChild: string = '';

  handleMessage(message: string): void {
  this.messageFromChild = message;
}

}