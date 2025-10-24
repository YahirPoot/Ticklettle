import { Component, ElementRef, inject, resource, ViewChild } from '@angular/core';
import { EventCardComponent } from "../event-card/event-card.component";
import { EventService } from '../../services/event.service';
import { Event } from '../../interfaces';

@Component({
  selector: 'event-carousel',
  imports: [EventCardComponent],
  templateUrl: './event-carousel.component.html',
})
export class EventCarouselComponent { 
  eventService = inject(EventService);
  @ViewChild('popularesCarousel', { read: ElementRef }) popularCarousel!: ElementRef<HTMLElement>;
  @ViewChild('proximosCarousel', { read: ElementRef }) proximosCarousel!: ElementRef<HTMLElement>;

  popularesResource = resource({
    loader: () => this.eventService.popular(), 
  });

  proximosResource = resource<Event[], unknown>({
    loader: () => this.eventService.upcoming(),
  });


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

}
