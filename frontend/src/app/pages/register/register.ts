import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Navbar } from '../../components/navbar/navbar';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.scss',
  imports: [CommonModule, FormsModule, RouterModule, Navbar],
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role = '';

  // validation flags
  passwordValid = {
    minLength: false,
    uppercase: false,
    number: false,
    specialChar: false,
  };
  passwordsMatch = false;

  submitting = false;

  constructor(private authService: AuthService, private router: Router) { }

  checkPassword() {
    this.passwordValid.minLength = this.password.length >= 8;
    this.passwordValid.uppercase = /[A-Z]/.test(this.password);
    this.passwordValid.number = /\d/.test(this.password);
    this.passwordValid.specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(this.password);

    this.checkConfirmPassword();
  }

  checkConfirmPassword() {
    this.passwordsMatch = this.password === this.confirmPassword && this.confirmPassword.length > 0;
  }

  isPasswordValid(): boolean {
    return Object.values(this.passwordValid).every(Boolean);
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  isFormValid(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.isEmailValid() &&
      this.role.trim().length > 0 &&
      this.isPasswordValid() &&
      this.passwordsMatch
    );
  }

  submit() {
    console.log("Register button clicked");

    if (!this.isFormValid()) {
      alert('Please fix validation errors before submitting.');
      return;
    }

    const allowedRoles = ["Consumer", "Farmer", "Distributor", "Retailer"];
    if (!allowedRoles.includes(this.role)) {
      alert("Only Consumer, Farmer, Distributor, Retailer allowed");
      return;
    }

    this.submitting = true;

    const payload = {
      name: this.name.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role,
    };

    console.log("Register payload:", payload);

    this.authService
      .register(payload)
      .subscribe({
        next: (res) => {
          this.submitting = false;
          console.log('Registration success:', res);
          alert('Registration successful 🎉');
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.submitting = false;
          console.error('Registration error:', err);
          alert(err?.error?.message || err?.error || 'Registration failed');
        },
      });
  }
}
