import { Component, inject, resource } from '@angular/core';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ZonesInterface } from '../../../shared/interfaces';


@Component({
  selector: 'app-detail-event',
  imports: [DatePipe, RouterLink],
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

  zones: ZonesInterface[] = [
    { id: 1, name: 'Zona Platinum', type: 'Adulto', price: 2500 },
    { id: 2, name: 'Zona Oro', type: 'Adulto', price: 2000 },
    { id: 3, name: 'Primer Nivel', type: 'Adulto', price: 1750 },
    { id: 4, name: 'Segundo Nivel', type: 'Adulto', price: 1500 },
  ]
}
