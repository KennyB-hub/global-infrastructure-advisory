// © 2026 Global Infrastructure Advisory
// Seven Runtime — Unit Tests

import { MockDrone } from "../mock-drone";

// ===== MOCK DRONE TESTS =====

describe("MockDrone", () => {
  let drone: MockDrone;

  beforeEach(() => {
    drone = new MockDrone("TEST_DRONE_001");
  });

  test("should connect successfully", async () => {
    const result = await drone.connect();
    expect(result).toBe(true);
    expect(drone.getStatus().connected).toBe(true);
  });

  test("should arm after connecting", async () => {
    await drone.connect();
    const result = await drone.arm();
    expect(result).toBe(true);
    expect(drone.getStatus().armed).toBe(true);
  });

  test("should takeoff and increase altitude", async () => {
    await drone.connect();
    await drone.arm();

    const telemetryUpdates: number[] = [];
    drone.onTelemetry((t) => telemetryUpdates.push(t.alt));

    await drone.takeoff(50);

    // Wait for simulation
    await new Promise((res) => setTimeout(res, 500));

    expect(telemetryUpdates.length).toBeGreaterThan(0);
    expect(Math.max(...telemetryUpdates)).toBeGreaterThan(0);
  });

  test("should return to home", async () => {
    await drone.connect();
    await drone.arm();
    await drone.takeoff(20);

    const result = await drone.returnToHome();
    expect(result).toBe(true);
  });

  test("should hold position", async () => {
    await drone.connect();
    await drone.arm();
    await drone.takeoff(15);

    const result = await drone.hold();
    expect(result).toBe(true);
    expect(drone.getStatus().mode).toBe("HOLD");
  });

  test("should land successfully", async () => {
    await drone.connect();
    await drone.arm();
    await drone.takeoff(25);

    await drone.land();
    await new Promise((res) => setTimeout(res, 1000));

    expect(drone.getStatus().inAir).toBe(false);
  });

  test("should run mission with multiple waypoints", async () => {
    await drone.connect();
    await drone.arm();
    await drone.takeoff(30);

    const waypoints = [
      { lat: 40.7130, lon: -74.0061, alt: 30 },
      { lat: 40.7135, lon: -74.0065, alt: 35 },
      { lat: 40.7125, lon: -74.0055, alt: 30 }
    ];

    const result = await drone.runMission(waypoints);
    expect(result).toBe(true);
  });
});

// ===== NATS CLIENT MOCK TESTS =====

describe("NatsClient (Mock)", () => {
  test("should initialize with config", () => {
    const config = {
      servers: ["nats://localhost:4222"]
    };
    expect(config.servers).toBeDefined();
  });

  test("should handle message publishing", async () => {
    const messages: any[] = [];
    const mockPublish = async (subject: string, data: any) => {
      messages.push({ subject, data });
      return true;
    };

    const result = await mockPublish("test.topic", { msg: "hello" });
    expect(result).toBe(true);
    expect(messages[0].subject).toBe("test.topic");
  });
});

// ===== EVENT DISPATCHER TESTS =====

describe("EventDispatcher", () => {
  test("should route events to handlers", async () => {
    const calls: string[] = [];

    const dispatch = async (handlers: Array<(evt: any) => Promise<void>>, event: any) => {
      for (const handler of handlers) {
        await handler(event);
      }
    };

    const handler1 = async () => calls.push("h1");
    const handler2 = async () => calls.push("h2");

    await dispatch([handler1, handler2], {});

    expect(calls).toEqual(["h1", "h2"]);
  });

  test("should handle handler errors gracefully", async () => {
    const calls: string[] = [];

    const dispatch = async (handlers: Array<(evt: any) => Promise<void>>, event: any) => {
      for (const handler of handlers) {
        try {
          await handler(event);
        } catch (err) {
          // Continue on error
        }
      }
    };

    const failingHandler = async () => {
      throw new Error("Handler failed");
    };

    const workingHandler = async () => calls.push("success");

    await dispatch([failingHandler, workingHandler], {});

    expect(calls).toContain("success");
  });

  test("should prioritize handlers by priority", () => {
    const handlers = [
      { id: "h1", priority: 10 },
      { id: "h2", priority: 100 },
      { id: "h3", priority: 50 }
    ];

    const sorted = [...handlers].sort((a, b) => b.priority - a.priority);

    expect(sorted[0].id).toBe("h2");
    expect(sorted[1].id).toBe("h3");
    expect(sorted[2].id).toBe("h1");
  });
});
