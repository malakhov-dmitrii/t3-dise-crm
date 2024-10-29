// NOTE: This is extremely important to be written like this
// because the iframe origin must be the same as the one in the iframe

import { env } from "@/env";

// This also should match telegram-tt origin environment variable for the parent
export const TG_CONFIG = {
  TG_IFRAME_URL: env.NEXT_PUBLIC_TG_IFRAME_URL,
  TG_FRAME_ORIGIN: env.NEXT_PUBLIC_TG_FRAME_ORIGIN,
};
