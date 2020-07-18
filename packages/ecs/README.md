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
  position: as<Vector2D>(),
  velocity: as<Vector2D>(),
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

while(true){
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
const { hp } = define({ hp: as<number>() });
```

> Note the [object destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) on the left-hand side of the line above.

The names of the components (and the constants that hold them) are used to identify components in queries later on.
This syntax allows the compiler to catch errors where the component name would be incorrect.

```typescript
// Component name mismatch
const { hp } = define({ healthPoints: as<number>() }); // TS2339: Property 'hp' does not exist on type 'Result  ; }>'.

// Missing destructuring
const hp = define({ hp: as<number>() });
createEngine().createEntity().set(hp, 42); // TS2345: Argument of type 'Result<number, { hp: ComponentDefinitionOptions<number>; }>' is not assignable to parameter of type 'Component<number>'.   Property 'componentId' is missing in type 'Result<number, { hp: ComponentDefinitionOptions<number>; }>' but required in type 'Component<number>'.
```

In many cases you will want to store more state in a single component.
You can define a component using an interface then.

```typescript
interface Vector2D {
  x: number;
  y: number;
}

const { position } = define({ position: as<Vector2D>() });
```

You may also define multiple components **of the same type** in a single call to the `define` function.

```typescript
const { position, velocity, acceleration } = define({
  position: as<Vector2D>(),
  velocity: as<Vector2D>(),
  acceleration: as<Vector2D>(),
});
```

### Defining flags

You may also create components that do not hold state at all.
You can use those components (called flags here) to find entities later on.

```typescript
const { rendered } = define({ rendered: asFlag() });
```

You do not need to specify the type of the data held in the flag.

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



### Mutating entity state

> TODO: mutating state is cheap, adding / removing components can be costly

### The 'tick' method

### Type checks at runtime

In most cases compile time checks are enough to provide reasonable type safety.

```typescript
const { hp } = define({ hp: as<number>() });

someEntity.set(hp, "low"); // Compile time error: "low" is not assignable to number
```

There might be times you would like to provide runtime checks too.
This might be useful if you read the state of an entity from JSON (like from a http response or from the local storage).
You can then provide a [type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types) when defining a component.

```typescript
function isNumber(x: any): x is number {
  return typeof x === "number";
}

const { hp, strictHp } = define({
  hp: as<number>(),
  strictHp: as<number>({ typeGuard: isNumber }),
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

> TODO: describe using external delta time
> TODO: describe constant delta stopwatch (usefull for machine learning etc.)
> TODO: describe slow-mo stopwatch
