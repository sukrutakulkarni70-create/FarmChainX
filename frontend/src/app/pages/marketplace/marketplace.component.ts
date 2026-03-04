import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-marketplace',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-950 text-white py-12">
  <div class="max-w-7xl mx-auto px-6">
    <h1 class="text-3xl font-bold mb-10 text-center">Marketplace</h1>

    <div class="grid gap-8 
                sm:grid-cols-2 
                md:grid-cols-3 
                lg:grid-cols-4 
                justify-items-center">

      <div *ngFor="let p of products"
     class="w-72 bg-white/10 p-4 rounded-xl shadow-lg hover:scale-105 transition">

  <img [src]="p.imagePath"
       class="h-40 w-full object-cover rounded mb-3">

  <h2 class="text-lg font-bold">{{ p.cropName }}</h2>
  <p class="text-sm text-gray-300">Farmer: {{ p.farmerName }}</p>
  <p class="text-emerald-400 font-semibold">₹{{ p.price }}</p>
  <p class="text-xs text-gray-400 mb-3">{{ p.status }}</p>

  <a [routerLink]="['/verify', p.publicUuid]"
   class="block text-center bg-emerald-600 hover:bg-emerald-700 py-2 rounded">
   Verify Product
</a>

</div>

    </div>
  </div>
</div>
  `
})
export class MarketplaceComponent implements OnInit {

  products: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<any[]>(`${environment.apiUrl}/products/market`)
      .subscribe(data => {
        this.products = data;
      });
  }
}