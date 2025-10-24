import { Component, inject, resource } from '@angular/core';
import { EventService } from '../../services/event.service';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-detail-event',
  imports: [DatePipe],
  templateUrl: './detail-event.component.html',
})
export class DetailEventComponent {
  private eventService = inject(EventService);
  private activatedRoute = inject(ActivatedRoute);

  private eventId: number = this.activatedRoute.snapshot.params['eventId'];

  eventResource = resource({
    loader: () => {
      console.log('Cargando evento con ID:', this.eventId);
      return this.eventService.byId(this.eventId);
    }
  });

  get event() {
    return this.eventResource.value();
  }

  zones = [
    { name: 'Zona Platinum', type: 'Adulto', price: 2500 },
    { name: 'Zona Oro', type: 'Adulto', price: 2000 },
    { name: 'Primer Nivel', type: 'Adulto', price: 1750 },
    { name: 'Segundo Nivel', type: 'Adulto', price: 1500 },
  ]
}
