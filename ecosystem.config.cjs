/** PM2 config — gebruikt door GitHub Actions deploy */
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
