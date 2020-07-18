# `ecs`

## Usage

### Mutating state
> TODO: mutating state is cheap, adding / removing components can be costly

###Measuring the passage of time
The engine queries an implementation of the `Stopwatch` interface once for each call of `tick()` method.
A stopwatch can be passed when creating an engine. Default value uses the `Date` class and returns delta time in milliseconds.

> TODO: describe using external delta time
> TODO: describe constant delta stopwatch (usefull for machine learning etc.)
> TODO: describe slow-mo stopwatch
