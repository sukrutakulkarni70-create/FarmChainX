import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private apiUrl = `${environment.apiUrl}/products/available`;

  constructor(private http: HttpClient) { }

  /** Fetch all available farmer product listings from the market */
  getMarketListings(): Observable<any[]> {
    console.log('[MarketService] Fetching available products from:', this.apiUrl);
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(data => {
        console.log('[MarketService] Live Data Flow Received:', data);
        if (data.length === 0) {
          console.warn('[MarketService] No products found in backend.');
        }
      })
    );
  }
}
