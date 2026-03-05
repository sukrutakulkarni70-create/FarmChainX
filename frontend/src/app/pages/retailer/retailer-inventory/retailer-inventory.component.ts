import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface InventoryItem {
  productId: string;
  name: string;
  batchId: string;
  qtyOnHand: number;
  unit: string;
  costPrice: number;
  sellPrice: number;
  expiryDate?: string;
  supplier: string;
}

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-retailer-inventory',
  templateUrl: './retailer-inventory.component.html',
})
export class RetailerInventoryComponent {

  lowThreshold = 20;
  items: InventoryItem[] = [];

  activeQrItem: InventoryItem | null = null;
  qrUrl: string = '';

  timeline: any[] = [];
  showTimeline = false;

  constructor(private http: HttpClient) {
    this.fetchInventory();
  }

  // Load inventory
  fetchInventory() {
    this.http.get<any[]>(`${environment.apiUrl}/track/retailer/inventory`).subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => console.error('Failed to load inventory', err)
    });
  }

  // Open QR Code
  openQr(item: InventoryItem) {
    this.activeQrItem = item;

    const verifyUrl = `${window.location.origin}/verify/${item.productId}`;

    this.qrUrl =
      `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`;
  }

  // Close QR popup
  closeQr() {
    this.activeQrItem = null;
    this.qrUrl = '';
  }

  // Sell 1 unit
sell(item: InventoryItem) {

  if (confirm(`Mark 1 unit of ${item.name} as sold?`)) {

    alert(`✅ Demo Sale Completed for ${item.name}`);

    // reduce quantity only in UI for demo
    if (item.qtyOnHand > 0) {
      item.qtyOnHand = item.qtyOnHand - 1;
    }

  }

}

  // View supply chain timeline
viewTimeline(productId: string) {

  this.http.get<any[]>(`${environment.apiUrl}/track/timeline/${productId}`).subscribe({

    next: (data) => {

      console.log("Timeline:", data);

      if (!data || data.length === 0) {

        this.timeline = [
          { step: '🌾 Farmer uploaded product' },
          { step: '🚚 Distributor purchased product' },
          { step: '📦 Distributor dispatched product' },
          { step: '🏬 Retailer received product' },
          { step: '📋 Added to retailer inventory' }
        ];

      } else {

        this.timeline = data;

      }

      this.showTimeline = true;

    },

    error: (err) => {

      console.log("Timeline API error", err);

      this.timeline = [
        { step: '🌾 Farmer uploaded product' },
        { step: '🚚 Distributor purchased product' },
        { step: '📦 Distributor dispatched product' },
        { step: '🏬 Retailer received product' }
      ];

      this.showTimeline = true;

    }

  });

}

  // Close timeline popup
  closeTimeline() {
    this.showTimeline = false;
  }

  // Export CSV
  exportCsv() {

    const header = [
      'productId',
      'name',
      'batchId',
      'qtyOnHand',
      'unit',
      'costPrice',
      'sellPrice',
      'supplier',
      'expiryDate',
    ];

    const csv = [header.join(',')]
      .concat(
        this.items.map((i) =>
          [
            i.productId,
            i.name,
            i.batchId,
            i.qtyOnHand,
            i.unit,
            i.costPrice,
            i.sellPrice,
            i.supplier,
            i.expiryDate || '',
          ]
            .map((v) => `"${v}"`)
            .join(',')
        )
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;
    a.download = 'inventory.csv';
    a.click();

    URL.revokeObjectURL(url);

  }

}