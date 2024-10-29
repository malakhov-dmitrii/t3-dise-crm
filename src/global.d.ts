import { formats } from "./i18n/request";
import type en from "./messages/en.json";

type Messages = typeof en;

type Formats = typeof formats;

declare global {
  // Use type safe message keys with `next-intl`
  type IntlMessages = Messages;
  type IntlFormats = Formats;
}
