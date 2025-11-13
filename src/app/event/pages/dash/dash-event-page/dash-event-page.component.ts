import { Component, inject, resource } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from "@angular/router";
import { EventService } from '../../../services/event.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dash-event-page',
  imports: [RouterLink, MatIconModule],
  templateUrl: './dash-event-page.component.html',
})
export class DashEventPageComponent { 
  eventService = inject(EventService);

  eventResource = resource({
    loader: () => firstValueFrom(this.eventService.getEvents()),
  })
  
  get events() {
    return this.eventResource.value();
  }
}
