import { Component, inject, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';
import { EventService } from '../../../services/event.service';
import { DatePipe } from '@angular/common';
import { TicketService } from '../../../../ticket/services/ticket.service';

@Component({
  selector: 'app-dash-detail-event-page',
  imports: [MatIconModule, HeaderBackComponent, DatePipe],
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
        return this.eventService.byId(this.eventId);
      }
  });

  ticketResource = resource({
    loader: () =>  this.ticketService.all(),
  })

  get eventById() {
    return this.eventResource.value();
  }

  get allTickets() {
    return this.ticketResource.value();
  }

  goBack() {
    return this.router.navigate(['/admin/events'], { relativeTo: this.activedRoute });
  }
}
