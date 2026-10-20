import devices from "./splash-devices.json";

interface SplashDevice {
  width: number;
  height: number;
  ratio: number;
}

/** Bestandsnaam gedeeld met scripts/generate-icons.mjs. */
export function splashFile(device: SplashDevice, landscape: boolean): string {
  const w = device.width * device.ratio;
  const h = device.height * device.ratio;
  return landscape ? `/splash/splash-${h}x${w}.png` : `/splash/splash-${w}x${h}.png`;
}

/** apple-touch-startup-image per iPhone/iPad-formaat, staand en liggend. */
export const SPLASH_STARTUP_IMAGES = (devices as SplashDevice[]).flatMap(
  (device) =>
    [false, true].map((landscape) => ({
      url: splashFile(device, landscape),
      media:
        `(device-width: ${device.width}px) and (device-height: ${device.height}px)` +
        ` and (-webkit-device-pixel-ratio: ${device.ratio})` +
        ` and (orientation: ${landscape ? "landscape" : "portrait"})`,
    }))
);
