import { Component, ElementRef, inject, resource, signal, ViewChild } from '@angular/core';
import { EventCardComponent } from "../event-card/event-card.component";
import { EventService } from '../../services/event.service';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'event-carousel',
  imports: [EventCardComponent, RouterLink],
  templateUrl: './event-carousel.component.html',
})
export class EventCarouselComponent { 
  eventService = inject(EventService);
  @ViewChild('popularesCarousel', { read: ElementRef }) popularCarousel!: ElementRef<HTMLElement>;
  @ViewChild('proximosCarousel', { read: ElementRef }) proximosCarousel!: ElementRef<HTMLElement>;

  // señales para estado de filtros (útil para UI)
  popularesFilter = signal<Record<string, any> | null>({ 'SpecialFilter.IsPopular': true });
  proximosFilter = signal<Record<string, any> | null>({ 'SpecialFilter.IsUpcoming': true });
  freeFilter = signal<Record<string, any> | null>({ 'SpecialFilter.IsFree': true });

  popularesResource = resource({
    loader: () => firstValueFrom(this.eventService.getEvents(this.popularesFilter() ?? undefined)), 
  });

  proximosResource = resource({
    loader: () => firstValueFrom(this.eventService.getEvents(this.proximosFilter() ?? undefined)), 
  });

  freeResource = resource({
    loader: () => firstValueFrom(this.eventService.getEvents(this.freeFilter() ?? undefined)),
  })

  get populares() {
    return this.popularesResource.value();
  }

  get proximos() {
    return this.proximosResource.value();
  }

  get freeEvents() {
    return this.freeResource.value();
  }

  refreshPopularesWith(filters: Record<string, any> | null) {
    this.popularesFilter.set(filters);
    this.popularesResource = resource({
      loader: () => firstValueFrom(this.eventService.getEvents(filters ?? undefined))
    });
  }

  refreshProximosWith(filters: Record<string, any> | null) {
    this.proximosFilter.set(filters);
    this.proximosResource = resource({
      loader: () => firstValueFrom(this.eventService.getEvents(filters ?? undefined))
    });
  }


  private resolveElement(container: ElementRef<HTMLElement> | HTMLElement | null): HTMLElement | null {
    if (!container) return null;
    // si es ElementRef devuelve nativeElement, si ya es HTMLElement devuélvelo directo
    return (container as any).nativeElement ?? (container as HTMLElement);
  }

  private visibleCountForWidth(width: number) {
    if (width < 640) return 1;       // mobile
    if (width < 768) return 2;       // small tablets
    return 3; 
  }

  public scrollNext(containerRef: ElementRef<HTMLElement> | HTMLElement | null) {
    const el = this.resolveElement(containerRef);
    if (!el) return;
    const visible = this.visibleCountForWidth(el.clientWidth)
    const amount = Math.floor(el.clientWidth / visible);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  public scrollPrev(containerRef: ElementRef<HTMLElement> | HTMLElement | null) {
    const el = this.resolveElement(containerRef);
    if (!el) return;
    const visible = this.visibleCountForWidth(el.clientWidth)
    const amount = Math.floor(el.clientWidth / visible);
    el.scrollBy({ left: -amount, behavior: 'smooth'});
  }

  // // util: togglear filtro popular (all / only popular)
  // togglePopularOnly(onlyPopular: boolean) {
  //   if (onlyPopular) this.refreshPopularesWith({ 'SpecialFilter.IsPopular': true });
  //   else this.refreshPopularesWith(null); // sin filtros => todos
  // }

  // // util: togglear upcoming
  // toggleUpcomingOnly(onlyUpcoming: boolean) {
  //   if (onlyUpcoming) this.refreshProximosWith({ 'SpecialFilter.IsUpcoming': true });
  //   else this.refreshProximosWith(null);
  // }

}
