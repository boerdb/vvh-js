/** PM2 config — handmatig starten/herstarten op de server */
module.exports = {
  apps: [
    {
      name: "vvh-js",
      cwd: "/var/www/vvh-js",
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: "3003",
      },
    },
  ],
};
