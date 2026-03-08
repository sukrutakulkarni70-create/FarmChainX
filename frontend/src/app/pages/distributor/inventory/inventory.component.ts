import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventory.component.html',
  providers: [DecimalPipe]
})
export class InventoryComponent implements OnInit {
  inventoryItems: any[] = [];
  totalValue = 0;

  constructor(
    private productService: ProductService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.productService.getDistributorInventory().subscribe(items => {
      // MOCK DATA: Ensures the team sees the bar even with an empty DB
      if (!items || items.length === 0) {
        this.inventoryItems = [{
          cropName: 'Organic Sweet Corn',
          productId: 'SC-101',
          status: 'In Stock',
          location: 'Warehouse A-12',
          value: 45000,
          quantity: 3500 // Result: 70% bar
        }];
      } else {
        this.inventoryItems = items;
      }
      this.totalValue = this.inventoryItems.reduce((acc, item) => acc + (item.value || 0), 0);
    });
  }

  // Logic for the progress bar width
  getStockLevel(quantity: number): number {
    const maxCapacity = 5000; 
    return Math.min((quantity / maxCapacity) * 100, 100);
  }

  getStatusColor(status: string): string {
    if (status === 'In Stock') return 'bg-blue-100 text-blue-800';
    if (status === 'Reserved') return 'bg-purple-100 text-purple-800';
    if (status === 'Low Stock') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }

  goToDispatch(item: any) {
    this.router.navigate(['/distributor/dispatch'], {
      state: { selectedProduct: item }
    });
  }
}
