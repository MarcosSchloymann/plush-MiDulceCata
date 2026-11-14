/** PM2 — producción en VPS (DonWeb u otro). */
module.exports = {
  apps: [
    {
      name: "midulcecata",
      cwd: "./server",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "400M",
      time: true,
    },
  ],
};
