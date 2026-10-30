import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Signal to store user state after successful login
  currentUser = signal<any>(null);
  constructor(private http: HttpClient) {}
  login(credentials: any): Observable<any> {
    return this.http.post("/user-login", credentials).pipe(
      tap((res: any) => {
        if (typeof res.accessToken !== 'string') {
          throw new Error('Login response did not include a Bearer access token.');
        }

        this.clearAccessToken();
        if (credentials.rememberMe) {
          localStorage.setItem('access_token', res.accessToken);
        } else {
          sessionStorage.setItem('access_token', res.accessToken);
        }
        this.currentUser.set(res.user);
        if (credentials.rememberMe) {
          localStorage.setItem('remember_user', credentials.username);
        } else {
          localStorage.removeItem('remember_user');
        }
      })
    );
  }
  restoreSession(): Observable<any> {
    const token = this.getAccessToken();
    if (!token) {
      this.currentUser.set(null);
      return of(null);
    }

    return this.http.get("/user-session", { headers: this.authHeaders(token) }).pipe(
      tap((res: any) => this.currentUser.set(res.user)),
      catchError((error) => {
        if (error.status === 401) {
          this.clearAccessToken();
          this.currentUser.set(null);
        }
        return throwError(() => error);
      })
    );
  }
  logout(): Observable<any> {
    const token = this.getAccessToken();
    return this.http.post(
      "/user-logout",
      {},
      token ? { headers: this.authHeaders(token) } : {}
    ).pipe(
      finalize(() => {
        this.clearAccessToken();
        this.currentUser.set(null);
      })
    );
  }
  private getAccessToken(): string | null {
    return localStorage.getItem('access_token') ?? sessionStorage.getItem('access_token');
  }
  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  private clearAccessToken(): void {
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
  }
  // Method to retrieve the remembered email/username for form initialization
  getRememberedEmail(): string {
    return localStorage.getItem('remember_user') ?? '';
  }
}
