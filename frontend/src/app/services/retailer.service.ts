import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  monthlySales: number;
  totalInventory: number;
  lowStockAlerts: number;
  activeOrders: number;
}

export interface SalesChartData {
  labels: string[];
  values: number[];
}

export interface RecentOrder {
  productName: string;
  supplier: string;
  quantity: number | string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class RetailerService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /** Fetch dashboard stats — falls back to empty data if API fails */
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/retailer/dashboard-stats`).pipe(
      catchError(err => {
        console.warn('[RetailerService] Stats API failed, using empty data.', err.message);
        return of({ monthlySales: 0, totalInventory: 0, lowStockAlerts: 0, activeOrders: 0 });
      })
    );
  }

  /** Fetch 7-day sales chart data — falls back to empty data if API fails */
  getSalesChartData(): Observable<SalesChartData> {
    return this.http.get<SalesChartData>(`${this.apiUrl}/retailer/sales-chart`).pipe(
      catchError(err => {
        console.warn('[RetailerService] Sales chart API failed, using empty data.', err.message);
        return of({ labels: [], values: [] });
      })
    );
  }

  /** Fetch all orders — connects to /api/orders */
  getOrders(): Observable<RecentOrder[]> {
    return this.http.get<any[]>(`${this.apiUrl}/orders`).pipe(
      map(orders => (orders || []).map(ord => ({
        productName: ord?.productName || 'Unknown Product',
        supplier: ord?.supplierName || 'Unknown Supplier',
        quantity: ord?.items ? `${ord.items} kg` : 'N/A',
        status: ord?.status || 'PROCESSING'
      }))),
      catchError(err => {
        console.warn('[RetailerService] Orders API failed, no data returned.', err.message);
        return of([]); 
      })
    );
  }

  /** Sell a product — reduces inventory and creates sale record */
  sellProduct(productId: string | number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sell`, { productId });
  }
}
