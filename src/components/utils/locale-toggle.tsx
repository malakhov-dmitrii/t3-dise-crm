"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";
import { api } from "@/trpc/react";
import { useTranslations } from "next-intl";

export function LocaleToggle() {
  const t = useTranslations("AppSidebar");
  const utils = api.useUtils();
  const { mutate: setLocale, isPending } = api.user.setLocale.useMutation({
    onSettled: async () => {
      await utils.user.getUser.invalidate();
      location.reload();
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" loading={isPending}>
          <Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <span className="sr-only">{t("Switch language")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => setLocale({ locale: "en" })}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale({ locale: "ru" })}>
          Русский
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
