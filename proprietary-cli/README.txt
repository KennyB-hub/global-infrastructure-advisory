⭐ Proprietary CLI — Internal Operator Tool (Private)
This directory contains the private, closed‑source operator CLI for Seven OS.
It is part of the sovereign control plane and must remain isolated from public code.

No secrets, keys, tokens, or sensitive operator data may ever be committed here.

📁 Directory Contents
bin/cli.js — CLI entrypoint

config.example.json — template configuration

config.json (ignored by git) — runtime operator config

core/ — loader, executor, registry, logger

commands/ — system, AI, dev, ops commands

helpers/ — shared utilities

package.json — module + binary definition

README.txt — this file

🔒 Security Requirements
This folder is proprietary and must remain private.

config.json is git‑ignored and must never be committed.

All secrets must be injected via environment variables or external vaults.

Commands must remain deterministic and safe for operator use.

No external telemetry unless explicitly enabled in config.json.

🧠 Purpose of This CLI
This CLI is the operator interface for Seven OS.
It provides:

system commands

AI organ execution

workflow triggers

dev utilities

ops/telemetry tools

It is the command‑line equivalent of Seven’s operator console.