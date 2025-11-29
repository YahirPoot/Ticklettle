import { Component, inject, resource } from '@angular/core';
import { RouterLink } from "@angular/router";
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../../event/services/event.service';
import AnalyticsService from '../../../event/services/analytics.service';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-dash-home-page',
  imports: [RouterLink, SlicePipe],
  templateUrl: './dash-home-page.component.html',
})
export class DashHomePageComponent { 
  private eventService = inject(EventService);
  private analyticsService = inject(AnalyticsService);

  getAnalyticsResource = resource({
    loader: () => firstValueFrom(this.analyticsService.getMyAnalytics()),
  })

  eventsResource = resource({
    loader: () => firstValueFrom(this.eventService.getEventsOrganizer()),
  })

  get getAnalytics() {
    return this.getAnalyticsResource.value();
  }

  get soldByLastMonth() {
    const analytics = this.getAnalytics;
    if (!analytics || !analytics.productsByMonth || analytics.productsByMonth.length === 0) {
      return 0;
    }
    return analytics.productsByMonth[analytics.productsByMonth.length - 1].month;
  }

}
