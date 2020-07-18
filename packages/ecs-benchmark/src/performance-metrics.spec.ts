import { performance } from "perf_hooks";
import { PerformanceMetrics, performanceMetrics } from "./performance-metrics";

describe("Performance metrics", () => {
  const measurementName = "my measurement";
  let metrics: PerformanceMetrics;

  async function measuredFunction() {
    performance.mark("start");
    await new Promise((resolve) => {
      setTimeout(resolve, 20);
    });
    performance.mark("end");
    performance.measure(measurementName, "start", "end");
  }

  beforeEach(() => {
    metrics = performanceMetrics();
  });

  describe('when measurements have not been done yet', () => {
    it("should not hold the measurement", () => {
      expect(metrics[measurementName]).toBeUndefined();
    });
  });

  describe("when a measurement is done once", () => {
    beforeEach(async () => {
      await measuredFunction();
    });

    it("should be calculated based on the single measurement", () => {
      expect(metrics[measurementName].count).toBe(1);
      expect(metrics[measurementName].totalDuration).toBeGreaterThan(0);
      expect(metrics[measurementName].averageDuration).toBe(
        metrics[measurementName].totalDuration
      );
    });
  });

  describe("when a measurement is done multiple times", () => {
    beforeEach(async () => {
      await measuredFunction();
      await measuredFunction();
      await measuredFunction();
    });

    it("should be calculated based on measurements", () => {
      expect(metrics[measurementName].count).toBe(3);
      expect(metrics[measurementName].totalDuration).toBeGreaterThan(0);
      expect(metrics[measurementName].averageDuration).toBe(
        metrics[measurementName].totalDuration / metrics[measurementName].count
      );
    });
  });
});
