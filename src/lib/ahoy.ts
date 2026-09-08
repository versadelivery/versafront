type TrackProperties = Record<string, unknown>;

type AhoyClient = {
  track(name: string, properties?: TrackProperties): void;
};

let clientPromise: Promise<AhoyClient | null> | null = null;

// A ahoy.js acessa `window` já no carregamento do módulo, então só pode ser
// importada no browser — no servidor o import quebraria a renderização.
function loadAhoy(): Promise<AhoyClient | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  if (!clientPromise) {
    clientPromise = import("ahoy.js")
      .then(({ default: ahoy }) => {
        ahoy.configure({
          urlPrefix: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
        });
        return ahoy as AhoyClient;
      })
      .catch(() => null);
  }

  return clientPromise;
}

const ahoy: AhoyClient = {
  track(name, properties) {
    void loadAhoy().then((client) => client?.track(name, properties));
  },
};

export default ahoy;
