// PM2 ecosystem file for collar WebSocket bridge
// Start with: pm2 start ecosystem.config.js --env production

module.exports = {
  apps: [
    {
      name: "collar-ws",
      script: "seven-os/backend/ws/run-collar-ws.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      watch: false,
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "development",
        NATS_URL: "nats://127.0.0.1:4222",
        WS_PORT: "8081"
      },
      env_production: {
        NODE_ENV: "production",
        NATS_URL: "nats://127.0.0.1:4222",
        WS_PORT: "8081"
      },
      out_file: "logs/collar-ws-out.log",
      error_file: "logs/collar-ws-err.log",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    }
  ]
};
