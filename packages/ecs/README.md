# `ecs`

An implementation of a [Entity component system](https://en.wikipedia.org/wiki/Entity_component_system) in TypeScript.
Makes heavy usage of TypeScript types system.
The focus of the design is to provide the maximum type safety and developer support while not sacrificing any execution speed.

## Usage (TL;DR version)

```typescript
interface Vector2D {
  x: number;
  y: number;
}

const { position, velocity } = define({
  position: As.a<Vector2D>(),
  velocity: As.a<Vector2D>(),
});

const engine = createEngine();

engine
  .createEntity()
  .set(position, { x: 1, y: 1 })
  .set(velocity, { x: 1, y: 1 });

engine.defineSystem({
  name: "velocity system",
  run: (entities) => {
    for (const [entity, state] of entities.thatHave({
      position,
      velocity,
    })) {
      state.position.x += state.velocity.x;
      state.position.y += state.velocity.y;
    }
  },
});

while (shouldRun) {
  engine.tick();
}
```

## Usage

### Creating engines

Engines are the central part of the library.
Using engines you will create and remove entities and define systems that act on them.

Use the `createEngine` function to create engines.
You may pass a `Partial<EngineConfig>` object to set some or all of the config values.
See: [Type checks at runtime](#type-checks-at-runtime), [Measuring the passage of time](#measuring-the-passage-of-time)

### Defining components

Components define the types of data your entities can hold as their state.
Components can also be used to find entities on which a given system is to act.

Use the following code to define a component:

```typescript
const { hp } = define({ hp: As.a<number>() });
```

> Note the [object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) on the left-hand side of the line above.

The names of the components (and the constants that hold them) are used to identify components in queries later on.
This syntax allows the compiler to catch errors where the component name would be incorrect.

```typescript
// Component name mismatch
const { hp } = define({ healthPoints: As.a<number>() }); // TS2339: Property 'hp' does not exist on type 'Result  ; }>'.

// Missing destructuring
const hp = define({ hp: As.a<number>() });
createEngine().createEntity().set(hp, 42); // TS2345: Argument of type 'Result<number, { hp: ComponentDefinitionOptions<number>; }>' is not assignable to parameter of type 'Component<number>'.   Property 'componentId' is missing in type 'Result<number, { hp: ComponentDefinitionOptions<number>; }>' but required in type 'Component<number>'.
```

In many cases you will want to store more state in a single component.
You can define a component using an interface then.

```typescript
interface Vector2D {
  x: number;
  y: number;
}

const { position } = define({ position: As.a<Vector2D>() });
```

You may also define multiple components in a single call to the `define` function.

```typescript
const { hp, position, velocity } = define({
  hp: As.a<number>(),
  position: As.a<Vector2D>(),
  velocity: As.a<Vector2D>(),
});
```

### Defining flags

You may also create components that do not hold state at all.
You can use those components (called flags here) to find entities later on.

```typescript
const { rendered } = define({ rendered: As.aFlag() });
```

You do not need to specify the type of the data held in the flag.

### Manually defining components
As the `Component<T>` interface is quite simple you might be tempted to manually create `type`s that use it
or `interface`s that extend it. **This approach is not recommended as you will lose compile type checks that
validate internal component ids. You may run into undefined behaviour then.** 

### Managing entities

Use the `engine` to create entities.
Once you have an entity you can add / remove state to / from it using the `set`, `setFlag` and `remove` methods.
Each of them returns the entity to enable call chaining.

```typescript
const engine = createEngine();

const myEntity = engine
  .createEntity()
  .set(position, { x: 1, y: 2 }) // The set method is typesafe, you can only pass data of the expected type
  .set(velocity, { x: 1, y: 1 })
  .set(hp, 42) // 'hp' is of type Component<number>, so we can pass a number here
  .setFlag(rendered);

// later on, to stop:

myEntity.remove(velocity);
```

At some point you may want to remove the entities.

```typescript
engine.remove(myEntity);
```

### Defining systems

System set up the logic and behaviour that act on the components held in entities.
The simplest way to define a system is to pass an object to `defineSystem` method on an engine.

The object needs to have a name, and a method called `run`.
On each execution of the [tick method](#the-tick-method), the `run` method of all system will be run.
The run method accepts two parameters:

1. The `Entities` object - you can use it to find and act on entities
2. The `deltaTime` - by default, the number of milliseconds since the last tick (see [Measuring the passage of time](#measuring-the-passage-of-time))

The systems will be called in the order they are defined.

```typescript
engine.defineSystem({
  name: "velocity system",
  run: (entities) => {
    for (const [entity, state] of entities.thatHave({
      position,
      velocity,
    })) {
      state.position.x += state.velocity.x;
      state.position.y += state.velocity.y;
    }
  },
});
```

### Mutating entity state

As you can see in the section above you can directly modify the state of the queried object.
**This is much cheaper in terms of performance than calling the `set` method.**
Use this method whenever you don't need to explicitly add a new component to an entity.

### The 'tick' method

Use the 'tick' method of the engine to run all defined systems once.
You will most likely want to call it once every frame.

### Type checks at runtime

In most cases compile time checks are enough to provide reasonable type safety.

```typescript
const { hp } = define({ hp: As.a<number>() });

someEntity.set(hp, "low"); // Compile time error: "low" is not assignable to number
```

There might be times you would like to provide runtime checks too.
This might be useful if you read the state of an entity from a non-typesafe source like a http response or the local storage.
You can then provide a [type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) when defining a component.

```typescript
function isNumber(x: any): x is number {
  return typeof x === "number";
}

const { hp, strictHp } = define({
  hp: As.a<number>(),
  strictHp: As.a<number>({ typeGuard: isNumber }),
});

const incorrectHp = JSON.parse('{"foo": "bar"}');

someEntity
  .set(hp, incorrectHp) // CAUTION: No error thrown as the value is of 'any' type!
  .set(strictHp, incorrectHp); // Runtime error thrown
```

If you want you can disable all runtime checks when going to production to eliminate any impact on performance.
To do that you need to pass a config value when creating an engine:

```typescript
const myEngine = createEngine({ typeChecks: false });
```

### Measuring the passage of time

The engine queries an implementation of the `Stopwatch` interface once for each call of `tick()` method.
A stopwatch can be passed when creating an engine. Default value uses the `Date` class and returns delta time in milliseconds.

If the framework you are using already provides the delta time you can use that instead.

```typescript
const externalStopwatch = {
  deltaTimeSinceLastTick: 0,
};

const engine = createEngine({ stopwatch: externalStopwatch });

// later on
externalStopwatch.deltaTimeSinceLastTick = someValue; // some value provided by the framework
engine.tick();
```

In some cases you may want to disable rendering systems and run as many ticks as quickly as possible.
One example is training an AI using machine learning.
In such case you may simulate a stable 60 fps framerate so that the physics do not need to be adjusted.

```typescript
const constantStopwatch = {
  deltaTimeSinceLastTick: 1000 / 60,
};

const engine = createEngine({ stopwatch: constantStopwatch });

while (shouldRun) {
  engine.tick();
}
```

You can also roll your own implementation of a stop watch for example to implement a slo-mo mode.

> Tip: Use a `get` [accessor](https://www.typescriptlang.org/docs/handbook/classes.html#accessors) if you need to
> call some logic to calculate the delta.
