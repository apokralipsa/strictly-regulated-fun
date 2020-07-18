import { PerformanceEntry, PerformanceObserver } from "perf_hooks";

interface PerformanceMetric {
  readonly averageDuration: number | null;
  readonly totalDuration: number;
  readonly count: number;
}

export interface PerformanceMetrics {
  readonly [key: string]: PerformanceMetric;
}

interface MutablePerformanceMetrics extends PerformanceMetrics {
  [key: string]: MutablePerformanceMetric;
}

export function performanceMetrics(): PerformanceMetrics {
  const metrics: MutablePerformanceMetrics = {};

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((measurement) => {
      const metric =
        metrics[measurement.name] || new MutablePerformanceMetric();
      metric.add(measurement);
      metrics[measurement.name] = metric;
    });
  });

  observer.observe({ entryTypes: ["measure"] });

  return metrics;
}

class MutablePerformanceMetric implements PerformanceMetric {
  totalDuration = 0;
  count = 0;
  averageDuration: PerformanceMetric['averageDuration'] = null;

  add(entry: PerformanceEntry) {
    this.count++;
    this.totalDuration += entry.duration;
    this.averageDuration = this.totalDuration / this.count;
  }
}
