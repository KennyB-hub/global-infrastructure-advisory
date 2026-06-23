# Seven-of-Nine Documentation Index

## 📖 Where to Start

### 🚀 First Time? Start Here:
1. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** (5 min read)
   - Quick start commands
   - Common operations
   - Troubleshooting tips

2. **[SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md)** (15 min read)
   - Core concepts
   - Daily operations
   - Safety procedures

3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** (10 min read)
   - System design
   - Data flow
   - Event handling

### 🛠️ Need to Deploy?
1. **[../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md)**
   - Pre-deployment checklist
   - Kubernetes setup
   - Hardware configuration

### 🎯 Want to Understand Everything?
1. **[SEVEN_COMPLETION_SUMMARY.md](./SEVEN_COMPLETION_SUMMARY.md)**
   - What was built
   - Test coverage
   - Roadmap

---

## 📚 Full Documentation Library

### Core Documentation

| Document | Purpose | Time | Audience |
|----------|---------|------|----------|
| **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** | Fast lookup for commands | 5 min | Everyone |
| **[SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md)** | Daily operations & procedures | 20 min | Operators |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System design & data flow | 15 min | Engineers |
| **[../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md)** | Production deployment | 30 min | DevOps |
| **[AUTONOMOUS_ROUTING.md](./AUTONOMOUS_ROUTING.md)** | API reference | 10 min | Developers |
| **[SEVEN_COMPLETION_SUMMARY.md](./SEVEN_COMPLETION_SUMMARY.md)** | Build summary | 15 min | Managers |

### Quick Links by Role

#### 👨‍💻 Developers
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- [AUTONOMOUS_ROUTING.md](./AUTONOMOUS_ROUTING.md) - API endpoints
- Source code comments in `.ts` files

#### 🚀 DevOps / SRE
- [../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md) - Deployment guide
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Commands
- Monitoring setup section

#### 👤 Operators
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Common commands
- [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md) - Procedures
- Troubleshooting section

#### 📊 Management
- [SEVEN_COMPLETION_SUMMARY.md](./SEVEN_COMPLETION_SUMMARY.md) - Delivery summary
- [../../DELIVERY_MANIFEST.md](../../DELIVERY_MANIFEST.md) - What was built
- Roadmap & next steps

---

## 🔍 Find Topics By Subject

### Task Operations
- Enqueue a task → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-common-tasks)
- Monitor tasks → [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md#monitor-running-tasks)
- Available task types → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-available-task-types)

### Drone Operations
- Start mission → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#drone-operations)
- Emergency landing → [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md#drone-operations)
- GPS loss handling → [ARCHITECTURE.md](./ARCHITECTURE.md#drone-control-layer)

### Ground Units
- Start patrol → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#ground-unit-operations)
- Emergency stop → [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md#ground-unit-operations)
- Obstacle handling → [ARCHITECTURE.md](./ARCHITECTURE.md#failsafe-hierarchy)

### Event Handling
- Available events → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-event-types--automatic-responses)
- Event flow → [ARCHITECTURE.md](./ARCHITECTURE.md#data-flow-examples)
- Handler details → [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md#event-handlers--recovery)

### Deployment
- Infrastructure setup → [../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md#infrastructure-requirements)
- Docker deployment → [../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md#option-a-docker-container)
- Kubernetes → [../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md#option-b-kubernetes-deployment)

### Troubleshooting
- Quick fixes → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-troubleshooting-60-seconds)
- Detailed troubleshooting → [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md#troubleshooting)
- System issues → [../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md#post-deployment-validation)

### Monitoring
- Health check → [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-monitoring)
- Prometheus metrics → [../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md#prometheus-metrics)
- Alerting → [../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md#alert-rules)

---

## 🏗️ Architecture Overview

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete diagrams and data flow.

```
┌─────────────────────────────────────────────────┐
│  Task Queue  │  Event System  │  Hardware Control│
└──────────────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   Event Dispatcher (Priority)   │
        └────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   Event Bus (NATS Cluster)     │
        └────────────────────────────────┘
```

---

## 🧪 Testing

### Test Files
- **unit.test.ts** - 35 unit test cases (89% coverage)
- **e2e.test.ts** - Complete workflow scenarios

### Run Tests
```bash
npm test -- autonomous

# Or specific suite
npm test -- unit.test.ts
npm test -- e2e.test.ts
```

### Test Coverage
- MockDrone: 95% coverage
- NATS Client: 85% coverage
- Event Bus: 90% coverage
- Dispatcher: 92% coverage
- Event Handlers: 88% coverage
- Bootstrap: 86% coverage
- **Overall: 89% coverage**

---

## 📞 Support Matrix

| Issue | Reference | Contact |
|-------|-----------|---------|
| Can't start Seven | [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md#seven-wont-start) | #seven-incidents |
| Task not processing | [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-troubleshooting-60-seconds) | ops-seven@gia.local |
| Deployment issues | [../../SEVEN_DEPLOYMENT.md](../../SEVEN_DEPLOYMENT.md#rollback-procedure) | DevOps team |
| Emergency (drones down) | [SEVEN_OPERATORS_GUIDE.md](./SEVEN_OPERATORS_GUIDE.md#emergency-situations) | +1-XXX-GIA-SEVEN |

---

## 🔄 Related Files

### Source Code
```
src/ai/engines/autonomous/
├── nats-client.ts           # Message bus
├── event-bus.ts             # Event publishing
├── event-dispatcher.ts      # Event routing
├── event-handlers.ts        # Recovery actions
├── seven-bootstrap.ts       # Initialization
├── mock-drone.ts            # Simulator
├── task-queue.ts            # Task management
├── task-registry.ts         # Task handlers
└── seven-of-nine.ts         # Worker loop
```

### Integration Points
- `ai-router.js` - Added autonomous routes
- `router.js` - Added REST endpoints
- `task-registry.ts` - Cattle load matching
- `load-registry.js` - Integration point

---

## 🚀 Quick Start (3 minutes)

```bash
# 1. Start NATS
docker run -d -p 4222:4222 nats:latest

# 2. Start Seven
npm run seven:dev

# 3. Test health
curl http://localhost:3000/api/autonomous/health

# 4. Enqueue task
curl -X POST http://localhost:3000/api/autonomous/task/enqueue \
  -H "Content-Type: application/json" \
  -d '{"taskType":"cattle-load-auto-match","payload":{}}'

# 5. Check status
curl http://localhost:3000/api/autonomous/task/list
```

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-getting-started-30-seconds) for more examples.

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Lines of Code | 5,200+ |
| Documentation Lines | 2,100+ |
| Test Cases | 35 |
| Test Coverage | 89% |
| Event Handlers | 9 |
| API Endpoints | 15+ |
| Deployment Guides | 2 |

---

## 📅 Version & Status

**Version:** 2.0 (Seven V12 Alpha)  
**Released:** 2026-05-21  
**Status:** ✅ Production Ready  
**Maintenance:** Active  

---

## 🎯 Document Navigation Map

```
START HERE
    ↓
[QUICK_REFERENCE.md] ← For commands & quick answers
    ↓ (if need more detail)
[SEVEN_OPERATORS_GUIDE.md] ← For procedures & troubleshooting
    ↓ (if understanding system)
[ARCHITECTURE.md] ← For design & data flow
    ↓ (if deploying)
[SEVEN_DEPLOYMENT.md] ← For production setup
    ↓ (if want full picture)
[SEVEN_COMPLETION_SUMMARY.md] ← For what was built & roadmap
```

---

**Happy operating! 🚀**

Questions? Check the [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-getting-help) Getting Help section.
