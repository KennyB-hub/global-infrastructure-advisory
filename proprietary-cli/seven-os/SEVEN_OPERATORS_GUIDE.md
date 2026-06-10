# Seven-of-Nine Operators Guide

## Overview

**Seven-of-Nine** is the autonomous operations system for GIA. It manages infrastructure monitoring, task queuing, drone/ground unit control, and event-driven response to field conditions.

## Quick Start

### 1. Starting Seven

```bash
# Development (test mode)
npm run seven:dev

# Production
npm run seven:start

# With logging
npm run seven:start -- --verbose
```

### 2. Check System Health

```bash
curl http://localhost:3000/api/autonomous/health
```

Expected response:
```json
{
  "healthy": true,
  "components": {
    "nats": true,
    "eventBus": true,
    "dispatcher": true,
    "initialized": true
  }
}
```

### 3. Enqueue a Task

```bash
curl -X POST http://localhost:3000/api/autonomous/task/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "taskType": "cattle-load-auto-match",
    "payload": {}
  }'
```

## Core Concepts

### Tasks vs Events

| Aspect | Task | Event |
|--------|------|-------|
| **Trigger** | Manual or scheduled | Automatic from devices/sensors |
| **Example** | Livestock matching, repo scan | Low battery, GPS loss, connection failure |
| **Response** | Background processing | Immediate handler execution |
| **Persistence** | Queued in task-queue.json | Published to NATS topics |

### Task Types

| Type | Triggered By | Handler | Outcome |
|------|-------------|---------|---------|
| `cattle-load-auto-match` | Enqueue endpoint | Matches open loads to haulers | Loads marked "matched" |
| `repo-scan` | Manual trigger | Scans repository structure | Writes data/repo-structure.json |
| `repo-analyze` | Manual trigger | Analyzes repo + generates suggestions | Writes data/repo-suggestions.json |
| `expand-sectors` | Manual trigger | Creates sector directory templates | Generates data/sectors/{id}/ |
| `generate-workflows` | Manual trigger | Generates workflow files | Writes data/sectors/{id}/workflows.json |
| `generate-ux-rules` | Manual trigger | Generates UX rules | Writes data/sectors/{id}/ux-rules.json |
| `generate-ai-engines` | Manual trigger | Generates AI engine stubs | Writes data/sectors/{id}/ai-engine.ts |

### Event Types

**Tower Events:**
- `tower:error` - Device malfunction
- `tower:power_loss` - Power failure
- `tower:connectivity` - Network issues

**Drone Events:**
- `drone:battery_low` - Battery below 25%
- `drone:gps_loss` - GPS signal lost
- `drone:altitude_anomaly` - Unexpected altitude change

**Ground Unit Events:**
- `ground:unit_lost` - Unit comms lost
- `ground:obstacle_detected` - Obstacle in path
- `ground:battery_critical` - Battery critical

## Common Operations

### Monitor Running Tasks

```bash
# List all tasks
curl http://localhost:3000/api/autonomous/task/list

# List pending tasks only
curl -X POST http://localhost:3000/api/autonomous/task/list \
  -d '{ "status": "pending" }'

# Check specific task
curl -X POST http://localhost:3000/api/autonomous/task/status \
  -d '{ "taskId": "TASK_1621234567_abc123" }'
```

### Manually Trigger Task Processing

```bash
# Process one pending task immediately
curl -X POST http://localhost:3000/api/autonomous/task/process
```

### Drone Operations

```bash
# Query drone status (via event system)
curl http://localhost:3000/api/autonomous/drone/status?droneId=DRONE_001

# Command drone to RTH (return to home)
curl -X POST http://localhost:3000/api/autonomous/drone/rth \
  -d '{ "droneId": "DRONE_001" }'

# Send drone to coordinates
curl -X POST http://localhost:3000/api/autonomous/drone/goto \
  -d '{
    "droneId": "DRONE_001",
    "lat": 40.7128,
    "lon": -74.0060,
    "alt": 50
  }'
```

### Ground Unit Operations

```bash
# Check ground unit status
curl http://localhost:3000/api/autonomous/ground/status?unitId=ROVER_001

# Send ground unit to patrol
curl -X POST http://localhost:3000/api/autonomous/ground/patrol \
  -d '{
    "unitId": "ROVER_001",
    "waypoints": [
      { "lat": 40.7128, "lon": -74.0060 },
      { "lat": 40.7130, "lon": -74.0062 }
    ]
  }'

# Emergency stop ground unit
curl -X POST http://localhost:3000/api/autonomous/ground/stop \
  -d '{ "unitId": "ROVER_001" }'
```

## Event Handlers & Recovery

Seven automatically responds to events with registered handlers:

### Power Loss Handler (Priority: 100)
```
Trigger: tower:power_loss
Actions:
  1. Notify all operators (Slack, email, dashboard)
  2. Initiate UPS activation
  3. Command all drones to RTH
  4. Queue recovery ticket
```

### Low Battery Handler (Priority: 90)
```
Trigger: drone:battery_low
Actions:
  - If < 15%: Immediate RTH
  - If < 25%: Alert operator to prepare landing
```

### GPS Loss Handler (Priority: 100)
```
Trigger: drone:gps_loss
Actions:
  1. Switch drone to ALTITUDE_HOLD mode
  2. Alert pilot for manual control
  3. Record last known position
  4. Escalate to critical alert
```

### Obstacle Detection Handler (Priority: 85)
```
Trigger: ground:obstacle_detected
Actions:
  - If < 1m: Emergency stop
  - If < 3m: Reduce speed to 50%
  - If > 3m: Continue at normal speed
```

## Troubleshooting

### Seven Won't Start

**Check NATS connection:**
```bash
ps aux | grep nats
# Expected: nats-server running on localhost:4222

# Or start NATS if not running
docker run -d -p 4222:4222 nats:latest
```

**Check logs:**
```bash
tail -f logs/seven.log | grep "\[Seven\]"
```

### Tasks Not Processing

**Verify task queue:**
```bash
# Check if tasks are enqueued
cat data/task-queue.json

# Manually trigger processor
curl -X POST http://localhost:3000/api/autonomous/task/process
```

**Check Seven-of-Nine worker:**
```bash
# Verify worker is running
ps aux | grep "seven.*worker"

# Or start it manually
npm run seven:worker
```

### Events Not Being Handled

**Check NATS subscriptions:**
```bash
# Verify Seven is subscribed to topics
curl http://localhost:3000/api/autonomous/status | jq '.eventBus.activeSubscriptions'
```

**Check handler registration:**
```bash
# Verify all 9 handlers registered
curl http://localhost:3000/api/autonomous/status | jq '.dispatcher.totalHandlers'
# Expected: >= 9
```

### Drone Not Responding

**Check drone connection:**
```bash
curl http://localhost:3000/api/autonomous/drone/status?droneId=DRONE_001
# Look for "connected": true
```

**If using SDK (MAVLink/DJI):**
```bash
# Verify SDK is initialized
grep "\[Drone\].*SDK" logs/seven.log

# Check MAVLink connection (if MAVLink)
python3 -m pymavlink.tools.mavwp --device /dev/ttyUSB0
```

**Fallback to mock drone for testing:**
```bash
curl -X POST http://localhost:3000/api/autonomous/drone/mock \
  -d '{ "droneId": "MOCK_DRONE_001" }'
```

## Performance Tips

### 1. Task Queue Size
Keep task queue clean to avoid slowdowns:
```bash
# Archive old tasks
node scripts/archive-old-tasks.js --days 7

# Monitor queue size
watch 'wc -l data/task-queue.json'
```

### 2. Handler Performance
Monitor handler execution times:
```bash
# Check slow handlers
grep "\[Dispatcher\]" logs/seven.log | \
  grep "Handler.*execution" | \
  awk '{print $NF}' | \
  sort -rn | head
```

### 3. NATS Memory Usage
NATS can grow if publishing high-frequency events:
```bash
# Reduce event frequency in production
export NATS_MESSAGE_THRESHOLD=100  # Only publish every Nth event

# Or use stream pruning
nats stream purge TOWER_EVENTS --keep 10000
```

## Safety Protocols

### Emergency Situations

| Situation | Immediate Action | Follow-up |
|-----------|------------------|-----------|
| **Power Loss** | All drones → RTH | Manual recovery, UPS check |
| **GPS Loss** | Altitude hold + alert | Pilot takes control |
| **Comms Lost** | Land/RTB sequence | Search and recovery |
| **Battery Critical** | Forced RTH | Recharge/replace |

### Failsafes

Seven includes built-in failsafes:
- **No heartbeat for 30s** → Force land
- **Battery < 10%** → Force RTH
- **GPS signal < 4 sats** → Altitude hold
- **Comms timeout** → Auto-RTH

To disable (advanced only):
```bash
# Edit config/failsafes.json
{
  "heartbeat_timeout_ms": 30000,
  "battery_critical_threshold": 10,
  "gps_min_sats": 4,
  "comms_timeout_ms": 5000
}
```

## API Reference

### Health Check
```
GET /api/autonomous/health
```

### Task Endpoints
```
POST /api/autonomous/task/enqueue
GET  /api/autonomous/task/status
POST /api/autonomous/task/process
GET  /api/autonomous/task/list
```

### Drone Endpoints
```
GET  /api/autonomous/drone/status
POST /api/autonomous/drone/arm
POST /api/autonomous/drone/disarm
POST /api/autonomous/drone/takeoff
POST /api/autonomous/drone/land
POST /api/autonomous/drone/goto
POST /api/autonomous/drone/rth
POST /api/autonomous/drone/mission
```

### Ground Endpoints
```
GET  /api/autonomous/ground/status
POST /api/autonomous/ground/goto
POST /api/autonomous/ground/patrol
POST /api/autonomous/ground/stop
POST /api/autonomous/ground/rtb
```

## Support & Escalation

### On-Call Escalation
1. **Level 1:** Operator acknowledges alert in dashboard
2. **Level 2:** On-call engineer notified if unresolved in 5 min
3. **Level 3:** Supervisor paged if critical issue unresolved in 10 min

### Contact Info
- **Ops Slack:** #seven-incidents
- **Email:** ops-seven@gia.local
- **Emergency Phone:** +1-XXX-GIA-SEVEN (24/7)

---

**Document Version:** 2.0 (Seven V12 Alpha)  
**Last Updated:** 2026-05-21  
**Maintained By:** Infrastructure Team
