# Seven-of-Nine: Quick Reference Card

## 🚀 Getting Started (30 seconds)

```bash
# 1. Initialize runtime
npm run seven:dev

# 2. Health check
curl http://localhost:3000/api/autonomous/health

# 3. Enqueue first task
curl -X POST http://localhost:3000/api/autonomous/task/enqueue \
  -H "Content-Type: application/json" \
  -d '{"taskType":"cattle-load-auto-match","payload":{}}'

# 4. Check status
curl http://localhost:3000/api/autonomous/task/list
```

## 📋 Common Tasks

### Drone Operations
```bash
# Takeoff
curl -X POST http://localhost:3000/api/autonomous/drone/takeoff \
  -d '{"droneId":"DRONE_001","altitude":50}'

# Fly to location
curl -X POST http://localhost:3000/api/autonomous/drone/goto \
  -d '{"droneId":"DRONE_001","lat":40.7128,"lon":-74.0060,"alt":50}'

# Multi-waypoint mission
curl -X POST http://localhost:3000/api/autonomous/drone/mission \
  -d '{
    "droneId":"DRONE_001",
    "waypoints":[
      {"lat":40.713,"lon":-74.006,"alt":50},
      {"lat":40.714,"lon":-74.007,"alt":55}
    ]
  }'

# Return to home
curl -X POST http://localhost:3000/api/autonomous/drone/rth \
  -d '{"droneId":"DRONE_001"}'

# Emergency land
curl -X POST http://localhost:3000/api/autonomous/drone/land \
  -d '{"droneId":"DRONE_001"}'
```

### Ground Unit Operations
```bash
# Start patrol
curl -X POST http://localhost:3000/api/autonomous/ground/patrol \
  -d '{
    "unitId":"ROVER_001",
    "waypoints":[
      {"lat":40.713,"lon":-74.006},
      {"lat":40.714,"lon":-74.007}
    ]
  }'

# Emergency stop
curl -X POST http://localhost:3000/api/autonomous/ground/stop \
  -d '{"unitId":"ROVER_001"}'

# Return to base
curl -X POST http://localhost:3000/api/autonomous/ground/rtb \
  -d '{"unitId":"ROVER_001"}'
```

### Task Management
```bash
# Enqueue task
curl -X POST http://localhost:3000/api/autonomous/task/enqueue \
  -d '{"taskType":"cattle-load-auto-match","payload":{}}'

# List pending tasks
curl http://localhost:3000/api/autonomous/task/list?status=pending

# Check task status
curl -X POST http://localhost:3000/api/autonomous/task/status \
  -d '{"taskId":"TASK_..."}'

# Process one task now
curl -X POST http://localhost:3000/api/autonomous/task/process
```

## 🎯 Available Task Types

| Task | Purpose | Input |
|------|---------|-------|
| `cattle-load-auto-match` | Auto-match livestock loads | `{}` |
| `repo-scan` | Scan repo structure | `{}` |
| `repo-analyze` | Analyze & suggest improvements | `{}` |
| `expand-sectors` | Create sector templates | `{}` |
| `generate-workflows` | Generate workflow files | `{}` |
| `generate-ux-rules` | Generate UX rules | `{}` |
| `generate-ai-engines` | Generate AI engine stubs | `{}` |

## ⚡ Event Types & Automatic Responses

| Event | Severity | Auto-Action |
|-------|----------|-------------|
| `tower:power_loss` | 🔴 Critical | UPS + RTH all drones |
| `drone:gps_loss` | 🔴 Critical | Altitude hold + alert |
| `ground:unit_lost` | 🔴 Critical | RTB + search alert |
| `drone:battery_low` | 🟠 High | RTH if < 15% |
| `ground:battery_critical` | 🟠 High | RTB immediately |
| `ground:obstacle_detected` | 🟡 Medium | Stop/slow if too close |
| `tower:error` | 🟡 Medium | Alert + maintenance ticket |

## 🔧 Configuration

### Environment Variables
```bash
# Message Bus
NATS_SERVERS=nats://localhost:4222

# Logging
SEVEN_LOG_LEVEL=info  # info, debug, error

# Hardware
SEVEN_ENABLE_DRONE_SDK=true
SEVEN_DRONE_SDK_TYPE=mavlink  # or 'dji'
SEVEN_ENABLE_GROUND_SDK=true

# Safety Thresholds
BATTERY_CRITICAL_PCT=10
COMMS_TIMEOUT_MS=5000
HEARTBEAT_TIMEOUT_MS=30000
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:3000/api/autonomous/health

# Returns: { healthy: true, components: {...} }
```

### System Status
```bash
curl http://localhost:3000/api/autonomous/status

# Shows: NATS, event bus, dispatcher, handler count
```

### View Logs
```bash
# Real-time logs
tail -f logs/seven.log

# Errors only
grep ERROR logs/seven.log

# Event processing
grep "Dispatcher\|Handler" logs/seven.log
```

## 🐛 Troubleshooting (60 seconds)

| Problem | Quick Fix |
|---------|-----------|
| **Seven won't start** | Check NATS: `docker run -d -p 4222:4222 nats:latest` |
| **Tasks not processing** | Manual trigger: `curl -X POST localhost:3000/api/autonomous/task/process` |
| **Drone not responding** | Check connection: `curl localhost:3000/api/autonomous/drone/status` |
| **Events not handled** | Verify handlers: Check logs for `\[Handler\]` lines |
| **NATS connection lost** | Auto-reconnect in 1-5 seconds (check `NATS_SERVERS` env) |

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md) | Daily operations, procedures, troubleshooting |
| [SEVEN_DEPLOYMENT.md](../SEVEN_DEPLOYMENT.md) | Production deployment, Kubernetes, monitoring |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, event handling |
| [AUTONOMOUS_ROUTING.md](./AUTONOMOUS_ROUTING.md) | API reference for all endpoints |
| [SEVEN_COMPLETION_SUMMARY.md](./SEVEN_COMPLETION_SUMMARY.md) | What was built, test coverage, roadmap |

## 🎓 Learning Path

### Beginner (Read These First)
1. This quick reference card
2. SEVEN_OPERATORS_GUIDE.md (Quick Start section)
3. Try the "Getting Started" commands above

### Intermediate
1. ARCHITECTURE.md (understand the system design)
2. AUTONOMOUS_ROUTING.md (learn all API endpoints)
3. Try advanced operations (missions, patrols)

### Advanced
1. Event handler code (event-handlers.ts)
2. Task registry (task-registry.ts)
3. SEVEN_DEPLOYMENT.md (understand production setup)

## ⏱️ Response Times

| Operation | Time | Notes |
|-----------|------|-------|
| Enqueue task | <100ms | In-memory queue |
| Task processing | 1-5s | Depends on handler |
| Drone takeoff | 3-5s | Including pre-flight checks |
| Drone mission | Seconds/minutes | Depends on waypoint count & distance |
| Event handling | <500ms | Priority-based routing |
| Emergency RTH | <1s | Immediate command, execution time varies |

## 🔐 Safety & Security

### Always Remember
- ⚠️ Manual override available at all times
- ⚠️ All actions logged and auditable
- ⚠️ Failsafes activate automatically
- ⚠️ Operator approval required for critical tasks (configurable)

### Failsafe Activation
```
No heartbeat for 30s  → Force land
Battery < 10%         → Force RTH
GPS < 4 satellites    → Altitude hold
Comms timeout 5s      → Auto-failsafe
Obstacle < 1m         → Emergency stop
```

## 🚀 Performance Tuning

### Increase Task Throughput
```bash
# Increase worker threads
export SEVEN_WORKER_THREADS=4

# Monitor queue size
watch 'curl http://localhost:3000/api/autonomous/task/list | jq ".total"'
```

### Reduce Event Latency
```bash
# Only publish every Nth event (reduce noise)
export NATS_EVENT_SAMPLING=100

# Increase handler priority for critical events
# (Edit event-handlers.ts)
```

### Monitor Resource Usage
```bash
# Check CPU/Memory
docker stats seven-container

# Check NATS memory
curl http://localhost:8222/varz | jq '.mem'
```

## 📞 Getting Help

1. **Documentation:** See links above
2. **Logs:** Check `logs/seven.log` for detailed error messages
3. **Health Check:** Run `curl http://localhost:3000/api/autonomous/health`
4. **NATS CLI:** `nats sub "seven.events.>"` to monitor all events
5. **Support:** Contact ops-seven@gia.local

---

**Version:** 2.0 (Seven V12 Alpha)  
**Last Updated:** 2026-05-21  
**Status:** ✅ Production Ready

Print this card or bookmark it for quick access! 📌
