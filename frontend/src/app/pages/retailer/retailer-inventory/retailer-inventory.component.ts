import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InventoryService, InventoryItem } from '../../../services/inventory.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  selector: 'app-retailer-inventory',
  templateUrl: './retailer-inventory.component.html',
})
export class RetailerInventoryComponent implements OnInit {

  // ─── State ────────────────────────────────────────────────────────────────
  items: InventoryItem[] = [];
  isLoading = true;
  errorMsg: string | null = null;

  lowThreshold = 10; // qty below this → show LOW badge

  // ─── QR Modal ─────────────────────────────────────────────────────────────
  activeQrItem: InventoryItem | null = null;
  qrUrl = '';

  // ─── Timeline Modal ───────────────────────────────────────────────────────
  timeline: any[] = [];
  showTimeline = false;

  // ─── Add Stock Modal ──────────────────────────────────────────────────────
  showAddStockForm = false;
  addStockForm = {
    productName: '',
    quantity: 0,
    unit: 'kg',
    costPrice: 0,
    sellPrice: 0,
    supplier: ''
  };
  addStockError: string | null = null;
  addStockSuccess = false;

  constructor(private inventoryService: InventoryService) { }

  ngOnInit(): void {
    // 1. Load from localStorage for demo persistence
    const saved = localStorage.getItem('retailer_inventory_fallback');
    if (saved) {
      this.items = JSON.parse(saved);
      this.inventoryService.pushLocalUpdate(this.items);
      this.isLoading = false;
    } else {
      this.loadInventory();
    }

    // 2. Listen for real-time updates from service
    this.inventoryService.inventory$.subscribe(data => {
      this.items = data;
      this.isLoading = false;
    });
  }

  // ─── Load Inventory ───────────────────────────────────────────────────────

  loadInventory(): void {
    this.isLoading = true;
    this.errorMsg = null;

    this.inventoryService.getInventory().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: err => {
        this.errorMsg = 'Failed to load inventory. Please try refreshing.';
        this.isLoading = false;
        console.error('Inventory load error:', err);
      }
    });
  }


  // ─── Sell Action (Frontend-only for Demo) ───────────────────────────────
  
  sell(item: InventoryItem): void {
    const qtyStr = prompt(`Enter quantity of "${item.productName}" to sell (Max: ${item.quantity} ${item.unit}):`);
    
    // User cancelled or empty
    if (qtyStr === null || qtyStr.trim() === '') return;

    const qty = Number(qtyStr);

    // Validation
    if (isNaN(qty) || qty <= 0) return;

    if (qty > item.quantity) {
      alert("Not enough stock");
      return;
    }

    // 🔥 Frontend Logic for Demo
    item.quantity = Number((item.quantity - qty).toFixed(2));
    
    // Update status dynamically
    if (item.quantity === 0) {
      item.status = 'OUT_OF_STOCK';
    } else if (item.quantity < 10) {
      item.status = 'LOW_STOCK';
    } else {
      item.status = 'IN_STOCK';
    }

    // Save to localStorage for persistence
    localStorage.setItem('retailer_inventory_fallback', JSON.stringify(this.items));

    alert("Sale successful!");
    
    // Log for the dashboard activity feed
    this.inventoryService.logActivity('SOLD', item.productName, qty, item.unit);

    // Trigger any other components listening to inventory$ (shared service)
    this.inventoryService.pushLocalUpdate(this.items);
  }

  // ─── QR Code Modal ────────────────────────────────────────────────────────

  openQr(item: InventoryItem): void {
    this.activeQrItem = item;
    const verifyUrl = `${window.location.origin}/verify/${item.productId}`;
    this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(verifyUrl)}`;
  }

  closeQr(): void {
    this.activeQrItem = null;
    this.qrUrl = '';
  }

  // ─── Supply Chain Timeline Modal ──────────────────────────────────────────

  viewTimeline(productId: string): void {
    this.inventoryService.getTimeline(productId).subscribe({
      next: data => {
        this.timeline = data;
        this.showTimeline = true;
      }
    });
  }

  closeTimeline(): void {
    this.showTimeline = false;
  }

  // ─── Add Stock Modal ──────────────────────────────────────────────────────

  openAddStock(): void {
    this.showAddStockForm = true;
    this.addStockError = null;
    this.addStockSuccess = false;
    // Reset form
    this.addStockForm = {
      productName: '',
      quantity: 0,
      unit: 'kg',
      costPrice: 0,
      sellPrice: 0,
      supplier: ''
    };
  }

  closeAddStock(): void {
    this.showAddStockForm = false;
  }

  submitAddStock(): void {
    this.addStockError = null;

    // Basic validation
    if (!this.addStockForm.productName.trim()) {
      this.addStockError = 'Product name is required.';
      return;
    }
    if (this.addStockForm.quantity <= 0) {
      this.addStockError = 'Quantity must be greater than 0.';
      return;
    }

    this.inventoryService.addStock({
      productName: this.addStockForm.productName.trim(),
      quantity: this.addStockForm.quantity,
      unit: this.addStockForm.unit,
      costPrice: this.addStockForm.costPrice,
      price: this.addStockForm.sellPrice,
      supplier: this.addStockForm.supplier.trim()
    }).subscribe({
      next: response => {
        this.addStockSuccess = true;

        // Optimistically add to the list for immediate visual feedback
        const newItem: InventoryItem = {
          productId: response?.productId ?? `demo-${Date.now()}`,
          productName: this.addStockForm.productName,
          batchId: `BATCH-${Date.now()}`,
          quantity: this.addStockForm.quantity,
          unit: this.addStockForm.unit,
          costPrice: this.addStockForm.costPrice,
          price: this.addStockForm.sellPrice,
          supplier: this.addStockForm.supplier || 'Manual Entry',
          status: this.addStockForm.quantity < this.lowThreshold ? 'LOW_STOCK' : 'IN_STOCK'
        };
        this.items = [newItem, ...this.items];
 
        // Save to localStorage for demo persistence
        localStorage.setItem('retailer_inventory_fallback', JSON.stringify(this.items));

        // Log for dashboard activity
        this.inventoryService.logActivity('ADDED', newItem.productName, newItem.quantity, newItem.unit);
        
        // Sync with dashboard and other components
        this.inventoryService.pushLocalUpdate(this.items);

        // Close modal after a short delay
        setTimeout(() => this.closeAddStock(), 1500);
      },
      error: err => {
        // Even if backend fails, for demo let's assume it works locally
        console.warn('Add stock backend failed, performing local-only update for demo.');
        const newItem: InventoryItem = {
          productId: `demo-${Date.now()}`,
          productName: this.addStockForm.productName,
          batchId: `BATCH-${Date.now()}`,
          quantity: this.addStockForm.quantity,
          unit: this.addStockForm.unit,
          costPrice: this.addStockForm.costPrice,
          price: this.addStockForm.sellPrice,
          supplier: this.addStockForm.supplier || 'Manual Entry',
          status: this.addStockForm.quantity < this.lowThreshold ? 'LOW_STOCK' : 'IN_STOCK'
        };
        this.items = [newItem, ...this.items];
        localStorage.setItem('retailer_inventory_fallback', JSON.stringify(this.items));
        this.inventoryService.pushLocalUpdate(this.items);
        this.addStockSuccess = true;
        setTimeout(() => this.closeAddStock(), 1500);
      }
    });
  }

  // ─── Status Badge Helper ──────────────────────────────────────────────────

  statusClass(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'IN_STOCK':    return 'badge-in-stock';
      case 'LOW_STOCK':   return 'badge-low-stock';
      case 'OUT_OF_STOCK': return 'badge-out-of-stock';
      default:            return 'badge-default';
    }
  }

  statusLabel(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'IN_STOCK':    return 'In Stock';
      case 'LOW_STOCK':   return 'Low Stock';
      case 'OUT_OF_STOCK': return 'Out of Stock';
      default:            return status || 'Unknown';
    }
  }


}