"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/common/language-selector";

export default function UnauthorizedPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-6">
        <LanguageSelector variant="pill" />
      </div>
      <ShieldX className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold tracking-tight">
        {t.common.accessDenied}
      </h1>
      <p className="text-muted-foreground mt-2 max-w-md text-sm">
        {t.common.accessDeniedDesc}
      </p>
      <div className="flex gap-4 mt-6">
        <Link href="/">
          <Button variant="outline">{t.common.home}</Button>
        </Link>
        <Link href="/login">
          <Button>{t.common.login}</Button>
        </Link>
      </div>
    </div>
  );
}
