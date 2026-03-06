import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-distributor-layout',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './distributor-layout.component.html',
})
export class DistributorLayoutComponent { }
