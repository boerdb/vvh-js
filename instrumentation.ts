export async function register() {
  // Pushmeldingen alleen in de Node-server (niet in edge of de build).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startPushWatcher } = await import("./lib/push/watcher");
    startPushWatcher();
  }
}
