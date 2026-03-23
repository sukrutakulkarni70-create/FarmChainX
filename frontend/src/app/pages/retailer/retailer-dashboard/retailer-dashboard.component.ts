import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { RetailerService, RecentOrder } from '../../../services/retailer.service';
import { InventoryService, InventoryItem } from '../../../services/inventory.service';

// Register all Chart.js modules once
Chart.register(...registerables);

@Component({
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './retailer-dashboard.component.html',
})
export class RetailerDashboardComponent implements AfterViewInit, OnDestroy {

  // ─── Template References ────────────────────────────────────────────────────
  // These names MUST match #salesChart and #inventoryChart in the HTML template
  @ViewChild('salesChart', { static: false }) salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('inventoryChart', { static: false }) inventoryChartRef!: ElementRef<HTMLCanvasElement>;

  private salesChartInstance: Chart | null = null;
  private inventoryChartInstance: Chart | null = null;

  // ─── State ──────────────────────────────────────────────────────────────────
  isLoading = true;
  error: string | null = null;

  // Summary metrics (Inventory-based)
  totalProducts = 0;
  totalQuantity = 0;
  lowStockCount = 0;
  outOfStockCount = 0;

  activityLog: any[] = [];

  constructor(
    private retailerService: RetailerService,
    private inventoryService: InventoryService
  ) { }

  ngAfterViewInit(): void {
    // Initial load
    this.refresh();
  }

  ngOnDestroy(): void {
    this.salesChartInstance?.destroy();
    this.inventoryChartInstance?.destroy();
  }

  // ─── Data Loading ────────────────────────────────────────────────────────────

  refresh(): void {
    this.isLoading = true;
    this.error = null;

    // 1. Sync Inventory from backend
    this.inventoryService.getInventory().subscribe({
      next: (inventory: InventoryItem[]) => {
        this.updateData(inventory);
        this.isLoading = false;
      },
      error: err => {
        console.error('Inventory load error:', err);
        this.error = 'Failed to load live inventory data.';
        this.isLoading = false;
      }
    });

    // 2. Sync Activity Log from backend
    this.inventoryService.refreshActivityLog();

    // 3. Keep UI responsive by listening to shared state
    this.inventoryService.activity$.subscribe(logs => {
      this.activityLog = logs;
    });
    
    this.inventoryService.inventory$.subscribe(inventory => {
      if (inventory && inventory.length > 0) {
        this.updateData(inventory);
      }
    });
  }

  private updateData(inventory: InventoryItem[]): void {
    this.calculateStats(inventory);
    this.updateCharts(inventory);
  }

  calculateStats(inventory: InventoryItem[]): void {
    const items = inventory || [];
    this.totalProducts = items.length;
    this.totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    this.lowStockCount = items.filter(item => item.quantity > 0 && item.quantity < 10).length;
    this.outOfStockCount = items.filter(item => (item.quantity || 0) <= 0).length;
  }

  updateCharts(inventory: InventoryItem[]): void {
    if (!inventory?.length) return;

    // --- 1. Bar Chart: Product Quantities ---
    const labels = inventory.map(i => i.productName);
    const values = inventory.map(i => i.quantity);
    this.renderSalesChart(labels, values);

    // --- 2. Doughnut Chart: Stock Status Distribution ---
    const inStock = inventory.filter(i => i.quantity >= 10).length;
    const lowStock = this.lowStockCount;
    const outStock = this.outOfStockCount;

    const statusLabels = ['In Stock', 'Low Stock', 'Out of Stock'];
    const statusValues = [inStock, lowStock, outStock];
    const statusColors = [
      'rgba(16, 185, 129, 0.85)', // Emerald
      'rgba(251, 191, 36, 0.85)', // Orange
      'rgba(239, 68, 68, 0.85)'   // Red
    ];
    this.renderInventoryChartFromData(statusLabels, statusValues, statusColors);
  }

  renderInventoryChartFromData(labels: string[], data: number[], colors: string[]): void {
    if (!this.inventoryChartRef?.nativeElement) return;
    this.inventoryChartInstance?.destroy();
    const ctx = this.inventoryChartRef.nativeElement.getContext('2d')!;
    this.inventoryChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { usePointStyle: true, padding: 15 }
          }
        }
      }
    });
  }

  // ─── Chart Rendering (repurposed for product quantities) ───────────────────

  renderSalesChart(labels: string[], values: number[]): void {
    if (!this.salesChartRef?.nativeElement) return;
    this.salesChartInstance?.destroy();

    const ctx = this.salesChartRef.nativeElement.getContext('2d')!;
    this.salesChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Quantity (kg)',
          data: values,
          borderRadius: 6,
          backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
          hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: ctx => ` Quantity: ${ctx.parsed.y} kg`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(0,0,0,0.05)' },
            title: { display: true, text: 'Inventory Level (kg)', font: { size: 10 } }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  statusClass(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'delivered': case 'sold': return 'status-delivered';
      case 'shipped': case 'added':  return 'status-shipped';
      case 'processing': return 'status-processing';
      case 'pending':   return 'status-pending';
      default:          return 'status-default';
    }
  }
}
