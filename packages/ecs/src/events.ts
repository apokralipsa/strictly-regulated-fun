export type EventType = string;

export interface Event<T extends EventType, S> {
  readonly type: T;
  readonly source: S;
}

export type Callback<T extends EventType, S> = (event: Event<T, S>) => void;

export interface Subscription<T extends EventType, S> {
  readonly eventType: T;
  readonly callback: Callback<T, S>;
}

export interface Events<T extends EventType, S> {
  subscribeTo(eventType: T, callback: Callback<T, S>): Subscription<T, S>;
  remove(subscription: Subscription<T, S>);
}

export class EventEmitter<T extends EventType, S> implements Events<T, S> {
  private readonly subscriptions: Map<T, Set<Subscription<T, S>>> = new Map();

  constructor(private source: S) {}

  subscribeTo(eventType: T, callback: Callback<T, S>): Subscription<T, S> {
    const subscriptions = this.subscriptionsTo(eventType);
    const newSubscription = { eventType, callback };
    subscriptions.add(newSubscription);
    return newSubscription;
  }

  emit(eventType: T) {
    const subscriptions = this.subscriptions.get(eventType);
    if (subscriptions) {
      const event = { type: eventType, source: this.source };
      subscriptions.forEach((sub) => sub.callback(event));
    }
  }

  remove(subscription: Subscription<T, S>) {
    this.subscriptionsTo(subscription.eventType).delete(subscription);
  }

  private subscriptionsTo(eventType: T) {
    let subscriptions = this.subscriptions.get(eventType);
    if (!subscriptions) {
      subscriptions = new Set();
      this.subscriptions.set(eventType, subscriptions);
    }

    return subscriptions;
  }
}
