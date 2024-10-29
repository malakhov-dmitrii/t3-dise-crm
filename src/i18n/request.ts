import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { type Formats } from "next-intl";
import { getRequestConfig } from "next-intl/server";

const locales = ["en", "ru"];

export default getRequestConfig(async () => {
  const session = await getServerAuthSession();
  const user = await api.user.getUser();
  // Provide a static locale, fetch a user setting,
  // read from `cookies()`, `headers()`, etc.
  const l = user?.language ?? session?.language ?? "en";
  const locale = locales.includes(l) ? l : "en";

  return {
    locale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

export const formats = {
  dateTime: {
    short: {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  },
  number: {
    precise: {
      maximumFractionDigits: 5,
    },
  },
  list: {
    enumeration: {
      style: "long",
      type: "conjunction",
    },
  },
} satisfies Formats;
