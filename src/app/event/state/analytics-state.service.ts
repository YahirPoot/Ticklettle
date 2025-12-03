import { Injectable, signal, computed } from '@angular/core';

export type AnalyticsPeriod = 'today' | 'week' | 'month' | 'last30' | 'all' | string;

@Injectable({ providedIn: 'root' })
export default class AnalyticsStateService {
  readonly selectedPeriod = signal<AnalyticsPeriod>('all');

  readonly selectedPeriodLabel = computed(() => {
    switch (this.selectedPeriod()) {
      case 'today': return 'Hoy';
      case 'week': return 'Últimos 7 días';
      case 'month': return 'Este mes';
      case 'last30': return 'Últimos 30 días';
      case 'all': return 'Todos los tiempos';
      default: return this.selectedPeriod();
    }
  });

  setSelectedPeriod(period: AnalyticsPeriod) {
    this.selectedPeriod.set(period);
  }
}
