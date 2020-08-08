import { EventEmitter, Event } from "./events";

describe("Events", () => {
  type SomeEventType = "foo" | "bar";

  let events: EventEmitter<SomeEventType, Object>;
  let someEntity: Object;

  beforeEach(() => {
    someEntity = {};
    events = new EventEmitter<SomeEventType, Object>(someEntity);
  });

  it("should allow to subscribe", () => {
    // given
    const receivedEvents: Event<SomeEventType, Object>[] = [];
    events.subscribeTo("foo", (event) => receivedEvents.push(event));

    // when
    events.emit("foo");

    // then
    expect(receivedEvents).toEqual([
      {
        type: "foo",
        source: someEntity,
      },
    ]);
  });

  it("should not call callback on unrelated events", () => {
    // given
    const receivedEvents: Event<SomeEventType, Object>[] = [];
    events.subscribeTo("foo", (event) => receivedEvents.push(event));

    // when
    events.emit("bar");

    // then
    expect(receivedEvents).toEqual([]);
  });

  it('should allow to unsubscribe', () => {
    // given
    const receivedEvents: Event<SomeEventType, Object>[] = [];
    const subscription = events.subscribeTo("foo", (event) => receivedEvents.push(event));

    // and
    events.remove(subscription)

    // when
    events.emit("foo");

    // then
    expect(receivedEvents).toEqual([]);
  });
});
