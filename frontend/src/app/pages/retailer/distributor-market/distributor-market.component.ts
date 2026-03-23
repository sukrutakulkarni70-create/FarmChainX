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
        const qty = item.selectedQty;

        // 🛑 1. Validation
        if (!qty || qty <= 0) {
            alert('❌ Please enter a valid quantity.');
            return;
        }

        if (qty > item.availableStock) {
            alert(`❌ Not enough stock! Market only has ${item.availableStock} ${item.unit} available.`);
            return;
        }

        const totalCost = item.price * qty;
        if (confirm(`Procure ${qty} ${item.unit} of ${item.productName} for ₹${totalCost.toLocaleString()}?`)) {
            this.purchasingId = item.id;

            const payload = {
                productId: item.id,
                productName: item.productName,
                quantity: qty,
                price: item.price,
                supplier: item.farmerName,
                retailerId: 0
            };

            this.http.post(`${environment.apiUrl}/orders`, payload).subscribe({
                next: (res: any) => {
                    alert(`✅ Order Placed Successfully!\n\nOrder ID: PO-${res.orderId}\nRemaining Market Stock: ${res.remainingMarketStock || res.remainingQty} ${item.unit}`);
                    this.purchasingId = null;
                    
                    // Refresh inventory in background
                    this.inventoryService.refreshInventory();
                    
                    // 🛑 2. Optimistic UI update: Reduce available stock immediately in the UI
                    item.availableStock -= qty;
                    item.selectedQty = 1; // reset selection
                    
                    if (item.availableStock === 0) {
                        this.marketItems = this.marketItems.filter(m => m.id !== item.id);
                    }
                },
                error: (err) => {
                    this.purchasingId = null;
                    const serverMsg = err.error?.error || err.error?.message || 'Server error occurred.';
                    alert(`❌ Failed: ${serverMsg}`);
                }
            });
        }
    }
}
