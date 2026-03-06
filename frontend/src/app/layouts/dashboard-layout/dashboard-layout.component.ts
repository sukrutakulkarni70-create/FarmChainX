import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';

@Component({
    selector: 'app-dashboard-layout',
    standalone: true,
    imports: [RouterOutlet, CommonModule, Navbar],
    templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent { }
