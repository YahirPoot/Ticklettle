import { Component, inject, resource } from '@angular/core';
import { EventService } from '../../services/event.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ZonesInterface } from '../../../shared/interfaces';
import { HeaderBackComponent } from '../../../shared/components/header-back/header-back.component';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-detail-event',
  imports: [DatePipe, RouterLink, HeaderBackComponent],
  templateUrl: './detail-event.component.html',
})
export class DetailEventComponent {
  private eventService = inject(EventService);
  private activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private eventId: number = this.activatedRoute.snapshot.params['eventId'];

  eventResource = resource({
    loader: () => {
      return firstValueFrom(
        this.eventService.getEventById(this.eventId),
      )
    }
  });

  get event() {
    return this.eventResource.value();
  }

  zones: ZonesInterface[] = [
    { id: 1, name: 'General', type: 'Adulto', price: 2500 },
    { id: 2, name: 'VIP', type: 'Adulto', price: 2000 },
    { id: 3, name: 'PREMIUN', type: 'Adulto', price: 1750 },
    // { id: 4, name: 'Segundo Nivel', type: 'Adulto', price: 1500 },
  ]

  goBack() {
    this.router.navigate(['/'], { relativeTo: this.activatedRoute });
  }
}
