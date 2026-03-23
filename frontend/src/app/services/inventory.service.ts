import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface InventoryItem {
  productId: string;
  productName: string;
  batchId: string;
  quantity: number;
  unit: string;
  costPrice: number;
  price: number; // Retail selling price
  expiryDate?: string;
  supplier: string;
  status: string; // IN_STOCK | LOW_STOCK | OUT_OF_STOCK
}

export interface AddStockPayload {
  productName: string;
  quantity: number;
  unit: string;
  costPrice: number;
  price: number;
  supplier: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryService {

  private apiUrl = environment.apiUrl;
  private readonly STORAGE_KEY = 'retailer_inventory_fallback';

  // State Management for "real-time" updates
  private inventorySubject = new BehaviorSubject<InventoryItem[]>([]);
  inventory$ = this.inventorySubject.asObservable();

  // Activity Log for demo purposes
  private activitySubject = new BehaviorSubject<any[]>([]);
  activity$ = this.activitySubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Log an action for the activity feed (Local update).
   */
  logActivity(action: 'SOLD' | 'ADDED', productName: string, quantity: number, unit: string): void {
    const newLog = {
      productName,
      action, // 'SOLD' or 'ADDED'
      quantity,
      unit,
      timestamp: new Date(),
      status: action === 'SOLD' ? 'DELIVERED' : 'PENDING'
    };
    const currentLogs = this.activitySubject.value;
    this.activitySubject.next([newLog, ...currentLogs].slice(0, 10)); // Keep latest 10
  }

  /**
   * Fetch recent activities from backend.
   */
  fetchActivityLog(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/retailer/activity`).pipe(
      tap(logs => this.activitySubject.next(logs)),
      catchError(() => of([]))
    );
  }

  /**
   * Refresh activity log from backend.
   */
  refreshActivityLog(): void {
    this.fetchActivityLog().subscribe();
  }

  /**
   * Fetch all inventory items for the logged-in retailer.
   * Prioritizes localStorage for demo purposes, fallback to API.
   */
  getInventory(): Observable<InventoryItem[]> {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      const items = JSON.parse(cached);
      this.inventorySubject.next(items);
      // We still return an observable for compatibility, but it's instant
      return of(items);
    }

    return this.http.get<InventoryItem[]>(`${this.apiUrl}/inventory`).pipe(
      map(items => items.map(item => this.normalize(item))),
      tap(normalized => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalized));
        this.inventorySubject.next(normalized);
      }),
      catchError(err => {
        console.warn('[InventoryService] API unavailable, using empty fallback.', err.message);
        this.inventorySubject.next([]);
        return of([]);
      })
    );
  }

  /**
   * Trigger a refresh of the inventory data.
   */
  refreshInventory(): void {
    this.getInventory().subscribe();
  }

  /**
   * Manually update the local inventory state (for demo purposes).
   */
  pushLocalUpdate(items: InventoryItem[]): void {
    this.inventorySubject.next(items);
  }

  /**
   * Sell a specific quantity of a product via the backend.
   */
  sellProduct(item: InventoryItem, quantity: number): Observable<any> {
    const payload = {
      productId: item.productId,
      productName: item.productName,
      quantity: quantity,
      price: item.price,
      supplier: item.supplier
    };
    return this.http.post(`${this.apiUrl}/sales`, payload);
  }

  /**
   * Add new stock item via the backend.
   */
  addStock(payload: AddStockPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/retailer/inventory/add`, payload);
  }

  /**
   * Fetch supply chain timeline for a product.
   */
  getTimeline(productId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/track/timeline/${productId}`).pipe(
      catchError(() => of([
        { step: '🌾 Farmer uploaded product' },
        { step: '🚚 Distributor purchased product' },
        { step: '📦 Distributor dispatched product' },
        { step: '🏬 Retailer received product' },
        { step: '📋 Added to retailer inventory' }
      ]))
    );
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /**
   * Normalize backend field names to match InventoryItem interface.
   */
  private normalize(raw: any): InventoryItem {
    return {
      productId:   raw.productId ?? raw.id?.toString() ?? 'unknown',
      productName: raw.productName ?? raw.name ?? raw.cropName ?? 'Unknown Product',
      batchId:     raw.batchId ?? `BATCH-${raw.productId ?? raw.id}`,
      quantity:    raw.quantity ?? raw.qtyOnHand ?? 0,
      unit:        raw.unit ?? 'kg',
      costPrice:   raw.costPrice ?? raw.pricePerUnit ?? 0,
      price:       raw.price ?? raw.sellPrice ?? (raw.pricePerUnit ? raw.pricePerUnit * 1.25 : 0),
      supplier:    raw.supplier ?? raw.createdBy ?? 'Distributor',
      status:      raw.status ?? (raw.quantity <= 0 ? 'OUT_OF_STOCK' : raw.quantity < 10 ? 'LOW_STOCK' : 'IN_STOCK'),
      expiryDate:  raw.expiryDate ?? raw.harvestDate ?? undefined
    };
  }
}
