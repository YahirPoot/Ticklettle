import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeSidebarComponent } from '../../components/home-sidebar/home-sidebar.component';

@Component({
  selector: 'home-layout',
  imports: [RouterOutlet, HomeSidebarComponent],
  templateUrl: './home-layout.component.html',
})
export class HomeLayoutComponent { 
  
}
