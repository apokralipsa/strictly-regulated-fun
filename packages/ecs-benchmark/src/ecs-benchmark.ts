import { my_ecs } from "./helper-my-ecs";
import { makr_test } from './helper-makr';
import { performanceMetrics } from './performance-metrics';

const { performance } = require("perf_hooks");

const metrics = performanceMetrics();
const CREATION_COUNT = 1000;

function createAddUpdateTest(test) {
  return {
    updates: test.count,
    name: test.name,
    fn: () => {
      test.setup();

      const start = performance.now();
      for (let i = 0; i < CREATION_COUNT; i++) {
        test.createEntities();
        test.update();
        test.update();
        test.update();
      }

      const end = performance.now();
      return end - start;
    },
  };
}

function createAddUpdateDestroyTest(test) {
  return {
    updates: test.count,
    name: test.name,
    fn: () => {
      test.setup();

      const all: any[] = [];
      const start = performance.now();
      for (let i = 0; i < CREATION_COUNT; i++) {
        const entities = test.createEntities();
        all.push(...entities);
        test.update();
        test.update();
        test.update();
        test.removeEntities([all[i], all[i * 2 + 1]]);
        all.splice(i * 2 + 1, 1);
        all.splice(i, 1);
      }

      const end = performance.now();
      return end - start;
    },
  };
}

function createAddUpdateDestroyRemoveTest(test) {
  return {
    name: test.name,
    updates: test.count,
    fn: () => {
      test.setup();

      const all: any[] = [];
      const start = performance.now();
      for (let i = 0; i < CREATION_COUNT; i++) {
        const entities = test.createEntities();
        all.push(...entities);
        test.update();
        test.update();
        test.update();
        test.removeEntities([all[i], all[i * 2 + 1]]);
        all.splice(i * 2 + 1, 1);
        all.splice(i, 1);
        test.removeVelocity([all[i + 1], all[i * 2]]);
      }

      const end = performance.now();
      return end - start;
    },
  };
}

function createAddUpdateDestroyCreateTest(test) {
  return {
    name: test.name,
    updates: test.count,
    fn: () => {
      test.setup();

      const all: any[] = [];
      const start = performance.now();
      for (let i = 0; i < CREATION_COUNT; i++) {
        const entities = test.createEntities();
        all.push(...entities);
        test.update();
        test.update();

        test.update();
        test.addVelocity(entities[0]);
        test.removeEntities([all[i], all[i * 2 + 1]]);
        all.splice(i * 2 + 1, 1);
        all.splice(i, 1);
      }

      const end = performance.now();
      return end - start;
    },
  };
}

const TEST_COUNT = 5;

function runTest(test: { fn: () => number; name: string; updates: any }) {
  let total = 0;
  for (let i = 0; i < TEST_COUNT; i++) {
    total += test.fn();
  }

  console.log(
    test.name +
      ": " +
      Math.round(total / TEST_COUNT) +
      "ms avg (" +
      test.updates.num +
      " updates)"
  );
}

console.log("Create and update");
runTest(createAddUpdateTest(my_ecs));
runTest(createAddUpdateTest(makr_test));

console.log("\nCreate, update and destroy");
runTest(createAddUpdateDestroyTest(my_ecs));
runTest(createAddUpdateDestroyTest(makr_test));

console.log("\nCreate, update, destroy and remove components");
runTest(createAddUpdateDestroyRemoveTest(my_ecs));
runTest(createAddUpdateDestroyRemoveTest(makr_test));

console.log("\nCreate, update, destroy and add components");
runTest(createAddUpdateDestroyCreateTest(my_ecs));
runTest(createAddUpdateDestroyCreateTest(makr_test));

console.log(metrics)
