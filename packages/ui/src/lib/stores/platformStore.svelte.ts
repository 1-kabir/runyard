export type Platform = "desktop" | "web" | "mobile";

function createPlatformStore() {
  let platform = $state<Platform>("desktop");

  return {
    get platform() {
      return platform;
    },
    setPlatform(newPlatform: Platform) {
      platform = newPlatform;
    }
  };
}

export const platformStore = createPlatformStore();
