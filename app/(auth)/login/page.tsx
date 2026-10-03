"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { LanguageSelector } from "@/components/common/language-selector";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authenticate } from "@/actions/auth";

function LoginForm() {
  const { t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await authenticate(values);
      if (res?.error) {
        setServerError(res.error);
        setIsSubmitting(false);
      } else {
        let destination = callbackUrl;
        const requestedCallback = searchParams.get("callbackUrl");
        if (!requestedCallback || requestedCallback === "/dashboard") {
          if (res?.role === "ADMIN" || res?.role === "SUPER_ADMIN") {
            destination = "/admin";
          } else if (res?.role === "VET") {
            destination = "/vet";
          }
        }
        window.location.href = destination;
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg border-border/80">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight text-primary">
            {t.common.platformName}
          </Link>
          {/* Subtle switcher on the card */}
          <LanguageSelector variant="pill" />
        </div>
        <div className="pt-2 text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            {t.auth.loginTitle}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            {t.auth.loginSubtitle}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">{t.auth.emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t.auth.emailPlaceholder}
              autoComplete="email"
              disabled={isSubmitting}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">{t.auth.passwordLabel}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full font-medium" disabled={isSubmitting}>
            {isSubmitting ? t.auth.loggingInButton : t.auth.loginButton}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground border-t pt-4">
        {t.auth.noAccount}{" "}
        <Link href="/register" className="ml-1 text-primary hover:underline font-medium">
          {t.auth.registerLink}
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
