import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrl: './login.scss',
  imports: [CommonModule, FormsModule, RouterModule, Navbar]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService   // ✔ Inject AuthService
  ) { }

  login() {
    this.http.post<any>(`${environment.apiUrl}/auth/login`, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (res) => {
        // ✔ Store into service (also updates localStorage)
        this.auth.setAuthFromResponse(res);

        alert('Login successful ✅');

        // Role-based redirection
        const role = res.role;
        if (role === 'Farmer') {
          this.router.navigate(['/farmer/dashboard']);
        } else if (role === 'Consumer') {
          this.router.navigate(['/consumer/dashboard']);
        } else if (role === 'Distributor') {
          this.router.navigate(['/distributor/dashboard']);
        } else if (role === 'Retailer') {
          this.router.navigate(['/retailer/dashboard']);
        } else if (role === 'Admin' || this.auth.isAdmin()) {
          this.router.navigate(['/admin/overview']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        const msg = err?.error?.error || 'Invalid email or password';
        alert(msg);
      }
    });
  }
}
