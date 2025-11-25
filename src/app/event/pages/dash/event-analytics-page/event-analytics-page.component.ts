import { Component, inject, resource } from '@angular/core';
import { TicketService } from '../../../../ticket/services/ticket.service';
import { HeaderBackComponent } from '../../../../shared/components/header-back/header-back.component';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import AnalyticsService from '../../../services/analytics.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-analytics-page',
  imports: [HeaderBackComponent, DatePipe],
  templateUrl: './event-analytics-page.component.html',
})
export class EventAnalyticsPageComponent { 
  private activatedRoute = inject(ActivatedRoute);

  private analyticsService = inject(AnalyticsService);;

  readonly eventId: number = this.activatedRoute.snapshot.params['eventId'];

  analyticsForEventResource = resource({
    loader: () =>  firstValueFrom(this.analyticsService.getAnalyticsByEvent(this.eventId)),
  });


  get analyticsForEvent() {
    return this.analyticsForEventResource.value();
  }

  get summary() {
    return this.analyticsForEvent?.summary;
  }
  goBack() {
    window.history.back();
  }

}
