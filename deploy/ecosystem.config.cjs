module.exports = {
  apps: [
    {
      name: "contract-docx-api",
      cwd: "/www/wwwroot/contract-docx-app/server",
      script: "src/index.js",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};

