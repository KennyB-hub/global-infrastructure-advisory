#!/bin/bash

curl -X POST "https://YOUR-WORKER-URL.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
        "workflow": "publicBriefing",
        "subject": "Platform Status",
        "content": "All systems operational.",
        "trustZone": "public"
      }'
      
bash gia-test.sh
