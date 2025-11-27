import { Component, inject, resource, signal } from '@angular/core';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';
import { EventService } from '../../services/event.service';
import { firstValueFrom } from 'rxjs';
import { EventCardComponent } from '../../components/event-card/event-card.component';

@Component({
  selector: 'app-next-event-page',
  imports: [HeaderBackComponent, EventCardComponent],
  templateUrl: './next-event-page.component.html',
})
export class NextEventPageComponent { 
  private eventService = inject(EventService);

  nextFilter = signal<Record<string, any> | null>({ 'SpecialFilter.IsUpcoming': true });

  nextEventsResource = resource({
    loader: () => firstValueFrom(this.eventService.getEvents(this.nextFilter() ?? undefined))
  })

  get nextEvents() {
    return this.nextEventsResource.value();
  }

  goBack() {
    window.history.back();
  }
}
