import { createEngine, Engine } from './engine';
import * as FakeTimers from '@sinonjs/fake-timers';
import { incorrectData, strictPosition } from './component.spec.fixture';

describe("Engine", () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createEngine();
  });

  it("should be created", () => {
    expect(engine).toBeDefined();
  });

  it("should create entities", () => {
    expect(engine.createEntity()).toBeDefined();
  });

  it("should run runtime type checks by default", () => {
    expect(() =>
      engine.createEntity().set(strictPosition, incorrectData)
    ).toThrow();
  });

  it("should give an option to disable runtime type checks", () => {
    expect(() =>
      createEngine({ typeChecks: false })
        .createEntity()
        .set(strictPosition, incorrectData)
    ).not.toThrow();
  });
});

describe("Measuring delta time between ticks", () => {
  let clock: FakeTimers.InstalledClock;
  let defaultDeltaTime: number;
  let customDeltaTime: number;

  let engineWithDefaultConfig: Engine;
  let engineWithCustomStopwatch: Engine;

  beforeAll(() => {
    clock = FakeTimers.install();
  });

  beforeEach(() => {
    engineWithDefaultConfig = createEngine().defineSystem({
      name: "default time",
      run: (entities, deltaTime) => {
        defaultDeltaTime = deltaTime;
      },
    });

    engineWithCustomStopwatch = createEngine({
      stopwatch: { deltaTimeSinceLastTick: 20 },
    }).defineSystem({
      name: "custom time",
      run: (entities, deltaTime) => {
        customDeltaTime = deltaTime;
      },
    });

    engineWithDefaultConfig.tick()
    engineWithCustomStopwatch.tick();
  });

  afterAll(() => {
    clock.uninstall();
  });

  it('should start at first tick', () => {
    expect(defaultDeltaTime).toBe(0)
    expect(customDeltaTime).toBe(20);
  });

  describe('when some time has passed between ticks', () => {
    beforeEach(() => {
      clock.tick(42);
      engineWithDefaultConfig.tick()
      engineWithCustomStopwatch.tick();
    });

    it('should consult the passed clock', () => {
      expect(defaultDeltaTime).toBe(42)
      expect(customDeltaTime).toBe(20);
    });
  });
});
