import { Component, inject, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';
import { EventService } from '../../../services/event.service';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../../../ticket/services/ticket.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dash-detail-event-page',
  imports: [MatIconModule, HeaderBackComponent, DatePipe, RouterLink],
  templateUrl: './dash-detail-event-page.component.html',
})
export class DashDetailEventPageComponent { 
  private activedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventService = inject(EventService);
  private readonly ticketService = inject(TicketService);

  private readonly eventId: number = this.activedRoute.snapshot.params['eventId'];

  eventResource = resource({
    loader: () => {
        return  firstValueFrom(this.eventService.getEventById(this.eventId));
      }
  });

  get eventById() {
    return this.eventResource.value();
  }

  get prroductsByEvent() {
    return this.eventById?.products || [];
  }

  goBack() {
    return this.router.navigate(['/admin/events'], { relativeTo: this.activedRoute });
  }
}
  