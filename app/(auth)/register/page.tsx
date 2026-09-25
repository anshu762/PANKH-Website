"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { LanguageSelector } from "@/components/common/language-selector";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { signIn } from "next-auth/react";

const PUNJAB_DISTRICTS = [
  "Ludhiana",
  "Amritsar",
  "Jalandhar",
  "Patiala",
  "Bathinda",
  "Sangrur",
  "Hoshiarpur",
  "Gurdaspur",
  "SAS Nagar (Mohali)",
  "Kapurthala",
  "Firozpur",
  "Sri Muktsar Sahib",
  "Faridkot",
  "Barnala",
  "Mansa",
  "Tarn Taran",
  "Fatehgarh Sahib",
  "Rupnagar",
  "SBS Nagar (Nawanshahr)",
  "Fazilka",
  "Pathankot",
  "Malerkotla",
];

export default function RegisterPage() {
  const { t, setLanguage } = useLanguage();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      role: "FARMER",
      preferredLanguage: "PUNJABI",
      village: "",
      district: "Ludhiana",
      state: "Punjab",
    },
  });

  // Restore draft on mount (Rule #7)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pankh_register_draft");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setValue("name", parsed.name);
        if (parsed.email) setValue("email", parsed.email);
        if (parsed.phone) setValue("phone", parsed.phone);
        if (parsed.preferredLanguage)
          setValue("preferredLanguage", parsed.preferredLanguage);
        if (parsed.village) setValue("village", parsed.village);
        if (parsed.district) setValue("district", parsed.district);
      }
    } catch {
      // ignore JSON errors
    }
  }, [setValue]);

  // Persist draft to localStorage on changes (Rule #7)
  const watchedValues = watch();
  useEffect(() => {
    try {
      const draft = {
        name: watchedValues.name,
        email: watchedValues.email,
        phone: watchedValues.phone,
        preferredLanguage: watchedValues.preferredLanguage,
        village: watchedValues.village,
        district: watchedValues.district,
      };
      localStorage.setItem("pankh_register_draft", JSON.stringify(draft));
    } catch {
      // ignore storage errors
    }
  }, [
    watchedValues.name,
    watchedValues.email,
    watchedValues.phone,
    watchedValues.preferredLanguage,
    watchedValues.village,
    watchedValues.district,
  ]);

  const onSubmit = async (values: RegisterInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await registerUser(values);
      if (res?.error) {
        setServerError(res.error);
        setIsSubmitting(false);
        return;
      }

      // Sync UI language context with preferredLanguage
      if (values.preferredLanguage === "PUNJABI") setLanguage("pa");
      else if (values.preferredLanguage === "HINDI") setLanguage("hi");
      else if (values.preferredLanguage === "HINGLISH") setLanguage("hinglish");
      else if (values.preferredLanguage === "ENGLISH") setLanguage("en");

      // Clear local draft upon success
      try {
        localStorage.removeItem("pankh_register_draft");
      } catch {
        // ignore
      }

      // Auto-login using NextAuth credentials
      const signInRes = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (signInRes?.error) {
        // Fallback to login screen if auto-login fails
        router.push("/login?registered=true");
      } else {
        router.push("/onboarding/farm");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-lg shadow-lg my-8 border-border/80">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xl font-serif font-bold tracking-tight text-primary flex items-center gap-2"
            >
              <div className="h-7 w-7 rounded-md bg-pankh-clay flex items-center justify-center text-white text-xs font-serif">
                ਪੰ
              </div>
              <span>{t.common.platformName}</span>
            </Link>
            <LanguageSelector variant="pill" />
          </div>
          <div className="pt-2 text-center space-y-1">
            <CardTitle className="text-2xl font-serif font-bold text-pankh-clay">
              {t.auth.registerTitle}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm font-sans">
              {t.auth.registerSubtitle}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">{t.auth.nameLabel}</Label>
                <Input
                  id="name"
                  placeholder={t.auth.namePlaceholder}
                  disabled={isSubmitting}
                  className="min-h-[44px]"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">{t.auth.phoneLabel}</Label>
                <Input
                  id="phone"
                  placeholder={t.auth.phonePlaceholder}
                  disabled={isSubmitting}
                  className="min-h-[44px]"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">{t.auth.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  disabled={isSubmitting}
                  className="min-h-[44px]"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t.auth.passwordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t.auth.passwordPlaceholder}
                  disabled={isSubmitting}
                  className="min-h-[44px]"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Farm Location Details */}
            <div className="pt-2 border-t border-border/60">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                {t.profile.farmDetails}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="village">{t.auth.villageLabel}</Label>
                  <Input
                    id="village"
                    placeholder={t.auth.villagePlaceholder}
                    disabled={isSubmitting}
                    className="min-h-[44px]"
                    {...register("village")}
                  />
                  {errors.village && (
                    <p className="text-xs text-destructive">
                      {errors.village.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="district">{t.auth.districtLabel}</Label>
                  <select
                    id="district"
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    disabled={isSubmitting}
                    {...register("district")}
                  >
                    {PUNJAB_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                  {errors.district && (
                    <p className="text-xs text-destructive">
                      {errors.district.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role & Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="preferredLanguage">{t.auth.languageLabel}</Label>
                <select
                  id="preferredLanguage"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  disabled={isSubmitting}
                  {...register("preferredLanguage")}
                >
                  <option value="PUNJABI">ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="HINGLISH">Hinglish</option>
                  <option value="HINDI">हिन्दी (Hindi)</option>
                  <option value="ENGLISH">English</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role">{t.auth.roleLabel}</Label>
                <select
                  id="role"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  disabled={isSubmitting}
                  {...register("role")}
                >
                  <option value="FARMER">{t.auth.roleFarmer}</option>
                  <option value="VET">{t.auth.roleVet}</option>
                </select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full font-bold min-h-[48px] text-sm bg-primary hover:bg-amber-600 text-white shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? t.auth.registeringButton : t.auth.registerButton}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground border-t pt-4">
          {t.auth.alreadyHaveAccount}{" "}
          <Link
            href="/login"
            className="ml-1 text-primary hover:underline font-semibold"
          >
            {t.auth.loginLink}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
