import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-forgot-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html'
})
export class ForgotPassword {

  email = '';
  message = '';
  loading = false;

  constructor(private http: HttpClient) {}

  submit() {
    if (!this.email.trim()) return;

    this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/forgot-password`, {
      email: this.email.trim()
    }).subscribe({
      next: () => {
        this.message = "If email exists, reset link sent.";
        this.loading = false;
      },
      error: () => {
        this.message = "Something went wrong.";
        this.loading = false;
      }
    });
  }
}