# Seven-of-Nine Deployment Guide

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] NATS.io cluster running (3+ nodes for HA)
- [ ] Database (PostgreSQL/MongoDB) for persistence
- [ ] Redis for caching (optional but recommended)
- [ ] Kubernetes cluster or Docker Swarm for orchestration
- [ ] Monitoring stack (Prometheus + Grafana)
- [ ] Logging (ELK or Loki)
- [ ] Message queue backup (S3 or equivalent)

### Hardware Requirements
- [ ] Drone SDK installed (MAVLink or DJI)
- [ ] Ground unit SDKs (ROS, dog harness firmware)
- [ ] Network connectivity to all tower locations
- [ ] GPS constellation access (outdoor operations)
- [ ] Radio frequency licenses (if required)

### Software Dependencies
```bash
# Node.js
node --version  # >= 18.0.0

# NATS
nats-server --version  # >= 2.8.0

# TypeScript
tsc --version  # >= 4.8.0

# Docker (for deployment)
docker --version  # >= 20.10
```

## Installation Steps

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/GIA/global-infrastructure-advisory.git
cd global-infrastructure-advisory/root
npm install

# For autonomous components
npm install nats axios  # NATS client + HTTP requests
```

### 2. Environment Configuration

Create `.env.seven`:
```env
# NATS Configuration
NATS_SERVERS=nats://nats-01:4222,nats://nats-02:4222,nats://nats-03:4222
NATS_USER=seven
NATS_PASSWORD=${NATS_PASSWORD}  # Set via secret manager; do NOT commit actual secrets

# Seven Configuration
SEVEN_ENVIRONMENT=production
SEVEN_LOG_LEVEL=info
SEVEN_ENABLE_DRONE_SDK=true
SEVEN_ENABLE_GROUND_SDK=true
SEVEN_DRONE_SDK_TYPE=mavlink

# Database
DB_HOST=postgres.internal
DB_PORT=5432
DB_NAME=seven_prod
DB_USER=seven
DB_PASSWORD=${DB_PASSWORD}  # Set via secret manager; do NOT commit actual secrets

# Monitoring
PROMETHEUS_PUSHGATEWAY=http://prometheus:9091
DATADOG_API_KEY=${DATADOG_API_KEY}  # Use secret store for this value

# Failsafe Thresholds
BATTERY_CRITICAL_PCT=10
COMMS_TIMEOUT_MS=5000
HEARTBEAT_TIMEOUT_MS=30000
```

### 3. Database Setup

```bash
# Create PostgreSQL schema
psql -h $DB_HOST -U $DB_USER -d $DB_NAME < schema/seven-schema.sql

# Initialize task queue table
psql -h $DB_HOST -U $DB_USER -d $DB_NAME \
  -c "CREATE TABLE task_queue (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );"
```

### 4. Compile TypeScript

```bash
npm run build:autonomous

# Verify compilation
ls -la dist/ai/engines/autonomous/
```

### 5. Start NATS Cluster

```yaml
# nats-cluster.yaml
# For Kubernetes
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: nats
  namespace: seven
spec:
  serviceName: nats
  replicas: 3
  selector:
    matchLabels:
      app: nats
  template:
    metadata:
      labels:
        app: nats
    spec:
      containers:
      - name: nats
        image: nats:2.8-alpine
        ports:
        - containerPort: 4222
        - containerPort: 6222
        - containerPort: 8222
        args:
        - -c
        - /etc/nats/nats.conf
        volumeMounts:
        - name: config
          mountPath: /etc/nats
      volumes:
      - name: config
        configMap:
          name: nats-config
```

Deploy:
```bash
kubectl apply -f nats-cluster.yaml
kubectl wait --for=condition=ready pod -l app=nats -n seven --timeout=300s
```

### 6. Deploy Seven Runtime

#### Option A: Docker Container

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY dist/ai/engines/autonomous ./

ENV NODE_ENV=production
ENV LOG_LEVEL=info

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "seven-bootstrap.js"]
```

Build & deploy:
```bash
docker build -t gia-seven:latest .
docker tag gia-seven:latest docker.io/gia/seven:latest
docker push docker.io/gia/seven:latest

# Deploy to Kubernetes
kubectl set image deployment/seven seven=docker.io/gia/seven:latest -n seven
```

#### Option B: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seven
  namespace: seven
spec:
  replicas: 3
  selector:
    matchLabels:
      app: seven
  template:
    metadata:
      labels:
        app: seven
    spec:
      serviceAccountName: seven
      containers:
      - name: seven
        image: docker.io/gia/seven:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NATS_SERVERS
          valueFrom:
            configMapKeyRef:
              name: seven-config
              key: nats-servers
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: seven-config
              key: db-host
        - name: DATADOG_API_KEY
          valueFrom:
            secretKeyRef:
              name: seven-secrets
              key: datadog-api-key
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            cpu: "500m"
            memory: "512Mi"
          limits:
            cpu: "2000m"
            memory: "2Gi"
```

Deploy:
```bash
kubectl apply -f seven-deployment.yaml
kubectl rollout status deployment/seven -n seven
```

### 7. Verify Installation

```bash
# Check Seven is running
kubectl get pods -n seven -l app=seven

# Check logs
kubectl logs -f deployment/seven -n seven

# Health check
curl http://localhost:3000/api/autonomous/health

# Expected response:
# {
#   "healthy": true,
#   "components": {
#     "nats": true,
#     "eventBus": true,
#     "dispatcher": true,
#     "initialized": true
#   }
# }
```

## Hardware SDK Configuration

### MAVLink (Drones)

```bash
# Install MAVLink libraries
pip3 install pymavlink dronekit dronekit-sitl

# For hardware drones, configure connection
export DRONE_CONNECTION_STRING="udp:127.0.0.1:14540"  # SITL
# Or: "dev/ttyUSB0" for USB cable
# Or: "192.168.1.100:14550" for network

# Test connection
python3 scripts/test-mavlink-connection.py
```

Configuration in Seven:
```typescript
// src/ai/engines/autonomous/seven-bootstrap.ts
const runtime = await initializeSevenRuntime({
  droneSDKType: "mavlink",
  // ... other config
});

// The SDK will connect using MAVLINK_CONNECTION string
```

### DJI SDK (Enterprise Drones)

```bash
# Install DJI Mobile SDK
npm install dji-mobile-sdk

# Configure API credentials
export DJI_API_KEY=${DJI_API_KEY}  # Set via secret manager
export DJI_API_SECRET=${DJI_API_SECRET}  # Set via secret manager

# Test connection
node scripts/test-dji-connection.js
```

### ROS (Ground Units)

```bash
# Install ROS and rosbridge
sudo apt-get install ros-humble-rosbridge-suite

# Start rosbridge
roslaunch rosbridge_server rosbridge_websocket.launch

# Configure Seven to connect to ROS
export ROS_BRIDGE_URL="ws://localhost:9090"
```

## Monitoring & Alerts

### Prometheus Metrics

Seven exports metrics:
```
# Task queue metrics
seven_task_queue_size{status="pending"}
seven_task_queue_size{status="running"}
seven_task_queue_size{status="done"}
seven_task_processing_duration_ms

# Event metrics
seven_events_published_total{type="tower:error"}
seven_events_handled_total{type="drone:battery_low"}
seven_handler_execution_duration_ms{handler="drone-battery-warning"}

# Hardware metrics
seven_drone_count{status="connected"}
seven_ground_unit_count{status="connected"}
```

Scrape config:
```yaml
# prometheus.yml
scrape_configs:
  - job_name: seven
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Alert Rules

```yaml
# seven-alerts.yaml
groups:
  - name: seven
    rules:
    - alert: SevenDowntime
      expr: up{job="seven"} == 0
      for: 1m
      annotations:
        summary: "Seven runtime is down"

    - alert: HighTaskQueueBacklog
      expr: seven_task_queue_size{status="pending"} > 1000
      for: 5m
      annotations:
        summary: "Task queue has {{ $value }} pending tasks"

    - alert: DroneConnectionLost
      expr: seven_drone_count{status="connected"} < 1
      for: 30s
      annotations:
        summary: "All drones offline"
```

### Datadog Integration (Optional)

```python
# Send metrics to Datadog
from datadog import api

api.Metric.send(
    metric='seven.task.queue.size',
    points=pending_task_count,
    tags=['env:production', 'component:task_queue']
)
```

## Rollback Procedure

If deployment fails:

```bash
# Check rollout history
kubectl rollout history deployment/seven -n seven

# Rollback to previous version
kubectl rollout undo deployment/seven -n seven

# Verify rollback
kubectl get pods -n seven -l app=seven
```

## Post-Deployment Validation

1. **Connectivity Tests**
   ```bash
   curl -X POST http://localhost:3000/api/autonomous/task/enqueue \
     -d '{ "taskType": "cattle-load-auto-match", "payload": {} }'
   ```

2. **Event Handler Tests**
   - Publish test event via NATS
   - Verify handler executes
   - Check recovery actions logged

3. **Load Testing**
   ```bash
   # Simulate high task load
   for i in {1..100}; do
     curl -X POST http://localhost:3000/api/autonomous/task/enqueue \
       -d "{ \"taskType\": \"cattle-load-auto-match\", \"payload\": {} }"
   done
   
   # Monitor performance
   kubectl top nodes
   kubectl top pods -n seven
   ```

4. **Failover Tests**
   - Kill one NATS node → Verify cluster recovers
   - Kill one Seven pod → Verify Kubernetes redeploys
   - Simulate network partition → Verify failsafe triggers

## Operations Handbook

See [`SEVEN_OPERATORS_GUIDE.md`](./SEVEN_OPERATORS_GUIDE.md) for:
- Daily operations
- Event response procedures
- Troubleshooting
- Emergency protocols

---

**Deployment Version:** 2.0  
**Last Updated:** 2026-05-21
