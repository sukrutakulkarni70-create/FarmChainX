import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { MarketService } from '../../../services/market.service';
import { InventoryService } from '../../../services/inventory.service';

@Component({
    selector: 'app-distributor-market',
    standalone: true,
    imports: [CommonModule, DecimalPipe, RouterModule, FormsModule],
    templateUrl: './distributor-market.component.html'
})
export class DistributorMarketComponent implements OnInit {
    marketItems: any[] = [];
    isLoading = true;
    purchasingId: number | null = null;
    errorMsg: string | null = null;

    constructor(
        private http: HttpClient,
        private marketService: MarketService,
        private inventoryService: InventoryService
    ) { }

    ngOnInit(): void {
        this.fetchMarket();
    }

    fetchMarket() {
        this.isLoading = true;
        this.errorMsg = null;
        
        this.marketService.getMarketListings().subscribe({
            next: (data) => {
                // Initialize default purchase quantity (1) for each product
                this.marketItems = data.map(item => ({
                    ...item,
                    availableStock: item.quantity, // Requested field name mapping
                    selectedQty: 1 
                }));
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching market:', err);
                this.errorMsg = 'Failed to load live market listings.';
                this.isLoading = false;
            }
        });
    }

  placeOrder(item: any) {

    if (!item.offerId) {
        alert("❌ offerId missing");
        return;
    }

    if (!confirm(`Accept ${item.cropName}?`)) return;

    this.http.post(
        `${environment.apiUrl}/dispatch/accept/${item.offerId}`,
        {}   // ✅ NO payload
    ).subscribe({
        next: () => {
            alert('✅ Accepted');

            this.marketItems = this.marketItems.filter(
                m => m.offerId !== item.offerId
            );
        },
        error: (err) => {
            alert('❌ Accept failed');
            console.error(err);
        }
    });
}
}

