import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { firstValueFrom } from 'rxjs';
import AnalyticsService from '../../../event/services/analytics.service';
import { SlicePipe } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { ResponseAnalitycsInterface } from '../../../event/interfaces';

@Component({
  selector: 'app-dash-home-page',
  imports: [RouterLink, SlicePipe, NgxEchartsModule],
  templateUrl: './dash-home-page.component.html',
})
export class DashHomePageComponent implements OnInit { 
  private analyticsService = inject(AnalyticsService);

  analytics = signal<ResponseAnalitycsInterface | null>(null);
  loading = signal(false);
  error = signal(false);

  ticketsChartOptions = signal<any | null>(null);
  productsChartOptions = signal<any | null>(null);

  constructor() {
    effect(() => {
      const data = this.analytics();
      if (!data) return;

      this.generateTicketsChart(data);
      this.generateProductsChart(data);
    });
  }

  ngOnInit(): void {
    this.loadAnalytics();
  }

  async loadAnalytics() {
    this.loading.set(true);
    this.error.set(false);

    try {
      const response = await firstValueFrom(this.analyticsService.getMyAnalytics());
      this.analytics.set(response);
      this.loading.set(false);

    } catch (err) {
      this.loading.set(false);
      this.error.set(true);
      console.error("Error al cargar analytics:", err);
    }
  }

  private generateTicketsChart(data: ResponseAnalitycsInterface) {
    const items = data.ticketsByMonth ?? [];

    this.ticketsChartOptions.set({
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: items.map(m => `Mes ${m.month}`),
        axisLabel: { color: "#999" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#999" }
      },
      series: [
        {
          name: "Boletos",
          type: "bar",
          data: items.map(m => m.value),
          itemStyle: { color: "#6366f1" }
        }
      ]
    });
  }

  private generateProductsChart(data: ResponseAnalitycsInterface) {
    const items = data.productsByMonth ?? [];

    this.productsChartOptions.set({
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "category",
        data: items.map(m => `Mes ${m.month}`),
        axisLabel: { color: "#999" }
      },
      yAxis: {
        type: "value",
        axisLabel: { color: "#999" }
      },
      series: [
        {
          name: "Productos",
          type: "line",
          smooth: true,
          data: items.map(m => m.value),
          lineStyle: { color: "#10b981" },
          areaStyle: { color: "#10b98133" }
        }
      ]
    });
  }

  get soldByLastMonth() {
    const data = this.analytics();
    if (!data?.productsByMonth?.length) return 0;

    return data.productsByMonth.at(-1)!.value;
  }
}
