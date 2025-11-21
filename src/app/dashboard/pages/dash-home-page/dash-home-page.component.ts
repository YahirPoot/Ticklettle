import { Component, inject, resource } from '@angular/core';
import { RouterLink } from "@angular/router";
import { first, firstValueFrom } from 'rxjs';
import { EventService } from '../../../event/services/event.service';

@Component({
  selector: 'app-dash-home-page',
  imports: [RouterLink],
  templateUrl: './dash-home-page.component.html',
})
export class DashHomePageComponent { 
  private eventService = inject(EventService);

  eventsResource = resource({
    loader: () => firstValueFrom(this.eventService.getEventsOrganizer()),
  })


  get getEvents() {
    return this.eventsResource.value()?.items || [];
  }
  events: any[] = [
    {
      eventId: 1,
      name: 'Festival Electrónico',
      location: 'CDMX',
      imageUrl: '',
      dateTime: '2025-11-01T20:00:00',
      status: 'Activo',
      ticketTypes: [
        { ticketTypeId: 1, name: 'general', price: 100, availableQuantity: 150, soldQuantity: 50 },
        { ticketTypeId: 2, name: 'vip', price: 200, availableQuantity: 30, soldQuantity: 20 },
      ],
      products: [
        { productId: 1, name: 'Playera', price: 150, stock: 20, soldQuantity: 5 }
      ]
    },
    {
      eventId: 2,
      name: 'Concierto Indie',
      location: 'Guadalajara',
      imageUrl: '',
      dateTime: '2025-12-05T19:00:00',
      status: 'Activo',
      ticketTypes: [
        { ticketTypeId: 3, name: 'general', price: 80, availableQuantity: 100, soldQuantity: 40 },
      ],
      products: []
    },
    {
      eventId: 3,
      name: 'Charla de Tecnología',
      location: 'Monterrey',
      imageUrl: '',
      dateTime: '2025-10-20T18:00:00',
      status: 'Inactivo',
      ticketTypes: [
        { ticketTypeId: 4, name: 'entrada', price: 50, availableQuantity: 200, soldQuantity: 150 },
      ],
      products: [
        { productId: 2, name: 'Cuaderno', price: 30, stock: 100, soldQuantity: 10 }
      ]
    }
  ];

  // simple monthly mock for tickets (last 6 months)
  ticketsByMonth = [
    { month: 'Jun', value: 120, percentage: 60 },
    { month: 'Jul', value: 80, percentage: 40 },
    { month: 'Aug', value: 160, percentage: 80 },
    { month: 'Sep', value: 200, percentage: 100 },
    { month: 'Oct', value: 140, percentage: 70 },
    { month: 'Nov', value: 90, percentage: 45 },
  ];

  // products by month mock
  productsByMonth = [
    { month: 'Jun', value: 20, percentage: 50 },
    { month: 'Jul', value: 10, percentage: 25 },
    { month: 'Aug', value: 30, percentage: 75 },
    { month: 'Sep', value: 40, percentage: 100 },
    { month: 'Oct', value: 22, percentage: 55 },
    { month: 'Nov', value: 15, percentage: 38 },
  ];

  // summary helpers
  eventsCount() {
    return this.getEvents.length || 0;
  }

  ticketTypesCount() {
    return this.getEvents.reduce((acc: number, ev: any) => acc + ((ev.ticketTypes?.length) || 0), 0) || 0
  }

  ticketsSoldTotal() {
    return this.getEvents.reduce((acc, ev) =>
      acc + (ev.ticketTypes || []).reduce((s: number, t: any) => s + (Number(t.soldQuantity || 0)), 0)
    , 0);
  }

  productsCount() {
    return this.eventsResource.value()?.items.reduce((acc: number, ev: any) => acc + ((ev.products?.length) || 0), 0) || 0
  }

  productsSoldTotal() {
    return this.getEvents.reduce((acc, ev) =>
      acc + (ev.products || []).reduce((s: number, p: any) => s + (Number(p.soldQuantity || 0)), 0)
    , 0);
  }

  estimatedRevenue() {
    return this.getEvents.reduce((acc, ev) =>
      acc + (ev.ticketTypes || []).reduce((s: number, t: any) => s + ((Number(t.soldQuantity || 0) * Number(t.price || 0))), 0)
    , 0);
  }

  topEventsByTickets() {
    return this.getEvents
      .map(ev => ({
        eventId: ev.eventId,
        name: ev.name,
        location: ev.location,
        imageUrl: ev.imageUrl,
        ticketsSold: (ev.ticketTypes || []).reduce((s: number, t:any) => s + (Number(t.soldQuantity||0)), 0),
        ticketTypesCount: (ev.ticketTypes || []).length
      }))
      .sort((a,b) => b.ticketsSold - a.ticketsSold)
      .slice(0, 6);
  }

  topProducts() {
    const all = this.getEvents.flatMap(ev => (ev.products || []).map((p:any) => ({ ...p, eventName: ev.name })));
    return all.sort((a,b) => (b.soldQuantity || 0) - (a.soldQuantity || 0)).slice(0,6);
  }

  recentSales() {
    // simplified recent sales mock: one entry per sold ticketType
    const rows:any[] = [];
    for (const ev of this.events) {
      for (const t of (ev.ticketTypes || [])) {
        if ((t.soldQuantity||0) > 0) {
          rows.push({
            eventName: ev.name,
            ticketTypeName: t.name,
            buyerName: '—',
            date: new Date(ev.dateTime),
            amount: (t.soldQuantity||0) * (t.price||0)
          });
        }
      }
    }
    return rows.sort((a,b)=>+new Date(b.date)-+new Date(a.date)).slice(0,20);
  }

  // active events list
  activeEvents() {
    return this.getEvents.filter(e => e.status === 'Activo');
  }

  // averages / simple metrics
  avgProductsPerEvent() {
    const evWith = this.getEvents.filter(e => (e.products||[]).length>0);
    if (!evWith.length) return 0;
    return Math.round(this.productsSoldTotal() / evWith.length);
  }

  avgOccupancyPercent() {
    // approximate: sold / (sold+available) average across events
    const percents = this.getEvents.map(ev=>{
      const sold = (ev.ticketTypes||[]).reduce((s:number,t:any)=>s+(t.soldQuantity||0),0);
      const available = (ev.ticketTypes||[]).reduce((s:number,t:any)=>s+(t.availableQuantity||0),0);
      if ((sold+available) === 0) return 0;
      return Math.round((sold / (sold + available)) * 100);
    });
    if (!percents.length) return 0;
    return Math.round(percents.reduce((a,b)=>a+b,0) / percents.length);
  }
}
