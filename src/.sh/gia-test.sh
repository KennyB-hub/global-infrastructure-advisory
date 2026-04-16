#!/bin/bash

curl -X POST "https://global-infrastructure-advisory.global-infrastructure-advisory.workers.dev.workers.dev" \
  -H "Content-Type: application/json" \
  -d '{
        "workflow": "publicBriefing",
        "subject": "Platform Status",
        "content": "All systems operational.",
        "trustZone": "public"
      }'
      
bash gia-test.sh
