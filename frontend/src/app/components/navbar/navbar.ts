import { Component,EventEmitter, HostListener, inject, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { NotificationService,AppNotification } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  templateUrl: './navbar.html'
})
export class Navbar {
    @Output() menuClick = new EventEmitter<void>();

  private router = inject(Router);
  private auth = inject(AuthService);
  private notificationService = inject(NotificationService);

  mobileMenuOpen = false;
  userMenuOpen = false;
  notifications: AppNotification[] = [];
  showNotifications = false;
  viewAll = false;

  // ⭐ NEW: Scroll detection for advanced UI
  isScrolled = false;

  // Detect scroll on window
  @HostListener('window:scroll')
  onScroll() {
    this.isScrolled = window.scrollY > 10;
  }

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  get userRole() {
    return this.auth.getRole();
  }

  get userName() {
    return this.auth.getName();
  }

  get isFarmer() {
    return this.auth.hasRole('ROLE_FARMER');
  }

  get isAdmin() {
    return this.auth.isAdmin();
  }

  // Detect clicks to close user menu when clicking outside
  @HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  if (!target.closest('.notification-wrapper')) {
    this.showNotifications = false;
  }

  if (!target.closest('.user-menu-wrapper')) {
    this.userMenuOpen = false;
  }
}

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.closeMobileMenu();
    this.userMenuOpen = false;
    this.router.navigate(['/login']);
  }
  loadNotifications() {
  if (!this.isLoggedIn) return;

  this.notificationService.getTopNotifications().subscribe({
    next: (data) => {
      this.notifications = data;
    },
    error: (err) => {
      console.error('Failed to load notifications', err);
    }
  });
}

toggleNotifications() {
  this.showNotifications = !this.showNotifications;

  if (this.showNotifications) {
    this.loadNotifications();
  }
}

get displayedNotifications() {
  return this.viewAll
    ? this.notifications
    : this.notifications.slice(0, 3);
}

toggleViewAll() {
  this.viewAll = !this.viewAll;
}

markRead(id: number) {
  this.notificationService.markAsRead(id).subscribe(() => {
    this.notifications = this.notifications.filter(n => n.id !== id);
  });
}
}
