import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  selector: 'app-retailer-layout',
  templateUrl: './retailer-layout.component.html',
})
export class RetailerLayoutComponent { }
