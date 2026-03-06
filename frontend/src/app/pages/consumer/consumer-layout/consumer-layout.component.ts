import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-consumer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './consumer-layout.component.html',
})
export class ConsumerLayoutComponent { }
