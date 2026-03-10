// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin-guard';
import { DashboardLayoutComponent } from './layouts/dashboard-layout/dashboard-layout.component';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';

export const routes: Routes = [
  // LANDING PAGES (No Navbar/Sidebar)
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPassword)
  },
  {
  path: 'verify',
  loadComponent: () => import('./components/verify-product/verify-product').then((m) => m.VerifyProduct),
},
  {
    path: 'verify/:uuid',
    loadComponent: () => import('./components/verify-product/verify-product').then((m) => m.VerifyProduct),
  },

  // DASHBOARD LAYOUT (With Navbar/Sidebar)
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'upload',
        loadComponent: () => import('./pages/upload-product/upload-product').then((m) => m.UploadProduct),
      },
      {
        path: 'scanner',
        loadComponent: () => import('./components/qr-scanner/qr-scanner/qr-scanner').then((m) => m.QrScanner),
      },
      {
        path: 'products/my',
        loadComponent: () => import('./pages/my-products/my-products').then((m) => m.MyProducts),
      },
      {
        path: 'marketplace',
        loadComponent: () => import('./pages/marketplace/marketplace.component').then(m => m.MarketplaceComponent)
      },

      // ROLE SPECIFIC ROUTES
      {
        path: 'farmer',
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/farmer/farmer-dashboard/farmer-dashboard').then(m => m.FarmerDashboard)
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
      },

      {
        path: 'consumer',
        loadComponent: () => import('./pages/consumer/consumer-layout/consumer-layout.component').then((m) => m.ConsumerLayoutComponent),
        children: [
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/consumer/consumer-dashboard/consumer-dashboard.component').then((m) => m.ConsumerDashboardComponent),
          },
          {
            path: 'retailers-inventory',
            loadComponent: () => import('./pages/consumer/retailers-inventory/retailers-inventory').then((m) => m.RetailersInventory),
          },
          {
            path: 'history',
            loadComponent: () => import('./pages/consumer/consumer-history/consumer-history.component').then((m) => m.ConsumerHistoryComponent),
          },
          {
            path: 'notifications',
            loadComponent: () => import('./pages/consumer/consumer-notifications/consumer-notifications.component').then((m) => m.ConsumerNotificationsComponent),
          },
          {
            path: 'marketplace',
            loadComponent: () => import('./pages/consumer/consumer-marketplace/consumer-marketplace.component').then((m) => m.ConsumerMarketplaceComponent),
          },
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        ],
      },

      {
        path: 'admin',
        canActivate: [AdminGuard],
        loadComponent: () => import('./pages/admin/admin-layout/admin-layout').then((m) => m.AdminLayout),
        children: [
          {
            path: 'overview',
            loadComponent: () => import('./pages/admin/admin-overview/admin-overview').then((m) => m.AdminOverview),
          },
          {
            path: 'users',
            loadComponent: () => import('./pages/admin/admin-users/admin-users').then((m) => m.AdminUsers),
          },
          {
            path: 'logs',
            loadComponent: () => import('./pages/admin/admin-logs/admin-logs').then((m) => m.AdminLogs),
          },
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
        ],
      },

      {
        path: 'distributor',
        loadComponent: () => import('./pages/distributor/distributor-layout/distributor-layout.component').then((m) => m.DistributorLayoutComponent),
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/distributor/distributor-dashboard/distributor-dashboard.component').then((m) => m.DistributorDashboardComponent),
          },
          {
            path: 'profile',
            loadComponent: () => import('./pages/distributor/distributor-profile/distributor-profile.component').then((m) => m.DistributorProfileComponent),
          },
          {
            path: 'procurement',
            loadComponent: () => import('./pages/distributor/farmer-procurement/farmer-procurement.component').then((m) => m.FarmerProcurementComponent),
          },
          {
            path: 'logistics',
            loadComponent: () => import('./pages/distributor/inventory/inventory.component').then((m) => m.InventoryComponent),
          },
          {
            path: 'procurement-detail',
            loadComponent: () => import('./pages/distributor/procurement-detail/procurement-detail.component').then((m) => m.ProcurementDetailComponent),
          },
          {
            path: 'dispatch',
            loadComponent: () => import('./pages/distributor/dispatch/dispatch.component').then((m) => m.DispatchComponent),
          },
          {
            path: 'retailer-selection',
            loadComponent: () => import('./pages/distributor/retailer-selection/retailer-selection.component').then((m) => m.RetailerSelectionComponent),
          },
        ],
      },

      {
        path: 'retailer',
        loadComponent: () => import('./pages/retailer/retailer-layout/retailer-layout.component').then((m) => m.RetailerLayoutComponent),
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          {
            path: 'dashboard',
            loadComponent: () => import('./pages/retailer/retailer-dashboard/retailer-dashboard.component').then((m) => m.RetailerDashboardComponent),
          },
          {
            path: 'inventory',
            loadComponent: () => import('./pages/retailer/retailer-inventory/retailer-inventory.component').then((m) => m.RetailerInventoryComponent),
          },
          {
            path: 'dispatched-products',
            loadComponent: () => import('./pages/retailer/retailer-dispatched-products/retailer-dispatched-products.component').then((m) => m.RetailerDispatchedProductsComponent),
          },
          {
            path: 'orders',
            loadComponent: () => import('./pages/retailer/retailer-orders/retailer-orders.component').then((m) => m.RetailerOrdersComponent),
          },
          {
            path: 'shipments',
            loadComponent: () => import('./pages/retailer/retailer-shipments/retailer-shipments.component').then((m) => m.RetailerShipmentsComponent),
          },
          {
            path: 'market',
            loadComponent: () => import('./pages/retailer/distributor-market/distributor-market.component').then((m) => m.DistributorMarketComponent),
          },
        ],
      },
    ]
  },

  // fallback
  { path: '**', redirectTo: '' },
];
