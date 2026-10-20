/** PM2 config — handmatig starten/herstarten op de server */
module.exports = {
  apps: [
    {
      name: "vvh-js",
      cwd: "/var/www/vvh-js",
      script: "npm",
      // Poort via -p, net als het draaiende PM2-proces op de server.
      args: "run start -- -p 3004",
      env: {
        NODE_ENV: "production",
        PORT: "3004",
      },
    },
  ],
};
