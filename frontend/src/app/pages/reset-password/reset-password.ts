import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html'
})
export class ResetPassword implements OnInit {

  token = '';
  newPassword = '';
  confirmPassword = '';
  message = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  submit() {

    if (!this.newPassword || this.newPassword !== this.confirmPassword) {
      this.message = "Passwords do not match";
      return;
    }

    this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.message = "Password reset successful!";
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.message = err.error?.error || "Invalid or expired token";
        this.loading = false;
      }
    });
  }
}