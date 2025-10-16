import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { EventCardComponent } from "../event-card/event-card.component";

@Component({
  selector: 'event-carousel',
  imports: [MatIconModule, EventCardComponent],
  templateUrl: './event-carousel.component.html',
})
export class EventCarouselComponent { 
    public populares = Array.from({ length: 6 }).map((_, i) => (
    {
      id: i,
      title: `Evento popular ${i + 1}`,
      description: 'Breve descripción del evento popular.',
      image: 'https://placeimg.com/640/360/arch'
    }
  ));

  @ViewChild('popularesCarousel', { read: ElementRef }) popularCarousel!: ElementRef<HTMLElement>;
  @ViewChild('proximosCarousel', { read: ElementRef }) proximosCarousel!: ElementRef<HTMLElement>;

  private resolveElement(container: ElementRef<HTMLElement> | HTMLElement | null): HTMLElement | null {
    if (!container) return null;
    // si es ElementRef devuelve nativeElement, si ya es HTMLElement devuélvelo directo
    return (container as any).nativeElement ?? (container as HTMLElement);
  }

  public scrollNext(containerRef: ElementRef<HTMLElement> | HTMLElement | null) {
    const el = this.resolveElement(containerRef);
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.9);
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }

  public scrollPrev(containerRef: ElementRef<HTMLElement> | HTMLElement | null) {
    const el = this.resolveElement(containerRef);
    if (!el) return;
    const amount = Math.floor(el.clientWidth * 0.9);
    el.scrollBy({ left: -amount, behavior: 'smooth'});
  }

}
