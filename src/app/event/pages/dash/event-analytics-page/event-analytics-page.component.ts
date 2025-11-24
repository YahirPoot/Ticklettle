import { Component, inject, resource } from '@angular/core';
import { TicketService } from '../../../../ticket/services/ticket.service';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';
import { EventService } from '../../../services/event.service';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-event-analytics-page',
  imports: [HeaderBackComponent],
  templateUrl: './event-analytics-page.component.html',
})
export class EventAnalyticsPageComponent { 
  private activatedRoute = inject(ActivatedRoute);

  private ticketService = inject(TicketService);
  private EventService = inject(EventService);

  readonly eventId: number = this.activatedRoute.snapshot.params['eventId'];

  eventResource = resource({
    loader: () =>  firstValueFrom(this.EventService.getEventById(this.eventId)),
  });

  ticketResource = resource({
    loader: () =>  firstValueFrom(this.ticketService.getTicketsByAttendee()),
  });

  get eventById() {
    return this.eventResource.value();
  }

  get productsByEvent() {
    return this.eventResource.value()?.products || [];
  }

  goBack() {
    window.history.back();
  }

  get allTickets() {
    return this.ticketResource.value() || [];
  }
}
