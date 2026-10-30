import { Component, signal } from '@angular/core';
import { AuthService } from '../service/auth-service';

@Component({
  selector: 'app-login-auth-component',
  standalone: false,
  templateUrl: './login-auth-component.html',
  styleUrl: './login-auth-component.css',
})
export class LoginAuthComponent {
  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  message = signal('');
  constructor(private authService: AuthService) {}
  ngOnInit() {
    // Automatically retrieve email from CookieService on page load
    const savedEmail = this.authService.getRememberedEmail();
    if (savedEmail) {
      this.email.set(savedEmail);
      this.rememberMe.set(true); // Pre-check the "Remember Me" box
    }
    this.authService.restoreSession().subscribe({
      error: (err) => {
        if (err.status !== 401) {
          console.error('Unable to restore remembered session.', err);
        }
      }
    });
  }
  onLogin() {
    const payload = {
      username: this.email(),
      password: this.password(),
      rememberMe: this.rememberMe()
    };
    this.authService.login(payload).subscribe({
      next: (res) => {
        this.message.set('Login successful!');
      },
      error: (err) => {
        this.message.set('Invalid username or password!');
      }
    });
  }
}

