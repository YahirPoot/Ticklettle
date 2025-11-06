import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';

@Component({
  selector: 'app-dash-detail-event-page',
  imports: [MatIconModule, HeaderBackComponent],
  templateUrl: './dash-detail-event-page.component.html',
})
export class DashDetailEventPageComponent { 
  private activedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  goBack() {
    return this.router.navigate(['/admin/events'], { relativeTo: this.activedRoute });
  }
}
