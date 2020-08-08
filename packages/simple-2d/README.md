# `simple-2d`

Set of pre-built 2d components and systems to simplify
writing 2d games using [@strictly-regulated-fun/ecs](https://www.npmjs.com/package/@strictly-regulated-fun/ecs).

Provides some simple functions to operate on vectors.

## Usage

Define prebuilt systems.

```typescript
const engine = createEngine();
engine.defineSystem(accelerationSystem);
engine.defineSystem(velocitySystem);
engine.defineSystem(angularAccelerationSystem);
engine.defineSystem(angularVelocitySystem);
engine.defineSystem(maxVelocitySystem);
```

You may not need all of them.
For example, you may leave out the ones operating on acceleration
and directly change the velocities of your entities.

Create your entity:

```typescript
const { position, velocity, acceleration, rotation, maximumVelocity } = simple2dComponents;

const player = engine
  .createEntity()
  .set(position, { x: 1, y: 1 })
  .set(velocity, { dx: 0, dy: 0 })
  .set(maximumVelocity, 5)
  .set(rotation, Math.PI / 2);

// Accelerate in the direction you are pointing at.
player.set(acceleration, vectorInDirection(player.get(rotation), 10));
```
