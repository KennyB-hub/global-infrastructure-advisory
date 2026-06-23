// © 2026 Global Infrastructure Advisory
// Seven Runtime — Event Handlers (Tower, Drone, Ground Events)

import { InfraEvent, EventHandler } from "../event-bus";
import { getDispatcher } from "../event-dispatcher";
import { collarStateRedisHandler } from "./collar-state-redis-handler";

// ===== TOWER EVENTS =====

export const towerErrorHandler: EventHandler = {
  id: "tower-error-handler",
  event: "tower:error",
  priority: 100,
  handler: async (event: InfraEvent) => {
    console.log(`[Handler] Tower ${event.sourceId} error: ${event.payload.message}`);
    
    // Auto-recovery: alert operator, queue service ticket
    await notifyOperators({
      severity: event.severity,
      message: `Tower ${event.sourceId} malfunction detected`,
      action: "requires_maintenance"
    });
  }
};

export const towerPowerLossHandler: EventHandler = {
  id: "tower-power-loss-handler",
  event: "tower:power_loss",
  priority: 100,
  handler: async (event: InfraEvent) => {
    console.log(`[Handler] Tower ${event.sourceId} power loss`);
    
    // Critical: trigger UPS, alert ops, initiate drone RTH
    await initiateEmergencyProcedure({
      type: "power_loss",
      source: event.sourceId,
      timestamp: event.timestamp
    });
  }
};

export const towerConnectivityHandler: EventHandler = {
  id: "tower-connectivity-handler",
  event: "tower:connectivity",
  priority: 80,
  handler: async (event: InfraEvent) => {
    const { isConnected, signalStrength } = event.payload;
    console.log(`[Handler] Tower ${event.sourceId} connectivity: ${isConnected ? "online" : "offline"} (signal: ${signalStrength}%)`);
    
    if (!isConnected && signalStrength < 20) {
      await notifyOperators({
        severity: "warning",
        message: `Tower ${event.sourceId} signal weak (${signalStrength}%)`,
        action: "monitor"
      });
    }
  }
};

// ===== DRONE EVENTS =====

export const droneBatteryWarningHandler: EventHandler = {
  id: "drone-battery-warning",
  event: "drone:battery_low",
  priority: 90,
  handler: async (event: InfraEvent) => {
    const { battery } = event.payload;
    console.log(`[Handler] Drone ${event.sourceId} battery low: ${battery}%`);
    
    // Trigger RTH if critical
    if (battery < 15) {
      await triggerDroneRTH(event.sourceId);
    } else {
      await notifyOperators({
        severity: "warning",
        message: `Drone ${event.sourceId} battery at ${battery}%`,
        action: "prepare_landing"
      });
    }
  }
};

export const droneGPSLossHandler: EventHandler = {
  id: "drone-gps-loss",
  event: "drone:gps_loss",
  priority: 100,
  handler: async (event: InfraEvent) => {
    console.log(`[Handler] Drone ${event.sourceId} GPS signal lost`);
    
    // Immediate response: switch to local stabilization, alert pilot
    await switchDroneMode(event.sourceId, "ALTITUDE_HOLD");
    await notifyOperators({
      severity: "critical",
      message: `Drone ${event.sourceId} lost GPS - stabilizing on altitude hold`,
      action: "manual_recovery_required"
    });
  }
};

export const droneAltitudeAnomaly: EventHandler = {
  id: "drone-altitude-anomaly",
  event: "drone:altitude_anomaly",
  priority: 95,
  handler: async (event: InfraEvent) => {
    const { currentAlt, expectedAlt } = event.payload;
    console.log(`[Handler] Drone ${event.sourceId} altitude mismatch: ${currentAlt}m vs expected ${expectedAlt}m`);
    
    if (Math.abs(currentAlt - expectedAlt) > 20) {
      await triggerDroneRTH(event.sourceId);
    }
  }
};

// ===== GROUND EVENTS =====

export const groundUnitLostHandler: EventHandler = {
  id: "ground-unit-lost",
  event: "ground:unit_lost",
  priority: 100,
  handler: async (event: InfraEvent) => {
    console.log(`[Handler] Ground unit ${event.sourceId} lost GPS/comms`);
    
    // Trigger return-to-base if possible
    await triggerGroundUnitRTB(event.sourceId);
    
    // Alert for manual recovery
    await notifyOperators({
      severity: "critical",
      message: `Ground unit ${event.sourceId} lost - last position recorded`,
      action: "manual_search_required"
    });
  }
};

export const groundUnitObstacleHandler: EventHandler = {
  id: "ground-unit-obstacle",
  event: "ground:obstacle_detected",
  priority: 85,
  handler: async (event: InfraEvent) => {
    const { distance } = event.payload;
    console.log(`[Handler] Ground unit ${event.sourceId} obstacle at ${distance}m`);
    
    if (distance < 1) {
      // Emergency stop
      await stopGroundUnit(event.sourceId);
    } else if (distance < 3) {
      // Slow down
      await reduceGroundUnitSpeed(event.sourceId, 0.5);
    }
  }
};

export const groundUnitBatteryHandler: EventHandler = {
  id: "ground-unit-battery",
  event: "ground:battery_critical",
  priority: 90,
  handler: async (event: InfraEvent) => {
    console.log(`[Handler] Ground unit ${event.sourceId} battery critical`);
    
    // Trigger RTB immediately
    await triggerGroundUnitRTB(event.sourceId);
  }
};

// ===== HELPER FUNCTIONS =====

async function notifyOperators(alert: any) {
  console.log("[Notify] Operator alert:", alert);
  // Real: send to Slack, email, dashboard
}

async function initiateEmergencyProcedure(details: any) {
  console.log("[Emergency] Initiating procedure:", details);
  // Real: trigger UPS, RTH all drones, alert fire/safety
}

async function triggerDroneRTH(droneId: string) {
  console.log(`[Action] Triggering RTH for drone ${droneId}`);
  // Real: call DroneControl.returnToHome()
}

async function switchDroneMode(droneId: string, mode: string) {
  console.log(`[Action] Switching drone ${droneId} to mode ${mode}`);
  // Real: call DroneControl SDK
}

async function triggerGroundUnitRTB(unitId: string) {
  console.log(`[Action] Triggering RTB for ground unit ${unitId}`);
  // Real: call GroundControl.returnToBase()
}

async function stopGroundUnit(unitId: string) {
  console.log(`[Action] Emergency stop for ground unit ${unitId}`);
  // Real: call GroundControl with STOP command
}

async function reduceGroundUnitSpeed(unitId: string, factor: number) {
  console.log(`[Action] Reducing speed for ground unit ${unitId} by ${factor}x`);
  // Real: modulate speed control
}

// Export all handlers
export const eventHandlers = [
  towerErrorHandler,
  towerPowerLossHandler,
  towerConnectivityHandler,
  droneBatteryWarningHandler,
  droneGPSLossHandler,
  droneAltitudeAnomaly,
  groundUnitLostHandler,
  groundUnitObstacleHandler,
  groundUnitBatteryHandler,
  collarStateRedisHandler
];
