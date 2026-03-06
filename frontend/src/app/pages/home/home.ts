import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar],
  templateUrl: './home.html'
})
export class HomeComponent {
  get isLoggedIn(): boolean {
    return !!localStorage.getItem('fcx_token');
  }

  get isFarmer(): boolean {
    return localStorage.getItem('fcx_role') === 'ROLE_FARMER';
  }
}
