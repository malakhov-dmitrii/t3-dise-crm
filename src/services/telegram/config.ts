// NOTE: This is extremely important to be written like this
// because the iframe origin must be the same as the one in the iframe
// This also should match telegram-tt origin environment variable for the parent
export const TG_CONFIG = {
  TG_IFRAME_URL: "http://localhost:1234",
  TG_FRAME_ORIGIN: "http://localhost:1234",
};
