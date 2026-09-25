"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
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
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await registerUser(values);
      if (res?.error) {
        setServerError(res.error);
        setIsSubmitting(false);
      } else {
        router.push("/login?registered=true");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md shadow-lg my-8">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            ਨਵਾਂ ਖਾਤਾ ਬਣਾਓ / Register
          </CardTitle>
          <CardDescription>
            Join Pankh to monitor flock health and receive early disease alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {serverError}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">ਨਾਮ / Full Name</Label>
              <Input
                id="name"
                placeholder="Jaswinder Singh"
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">ਈਮੇਲ / Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="farmer@example.com"
                disabled={isSubmitting}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">ਪਾਸਵਰਡ / Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">ਫ਼ੋਨ ਨੰਬਰ / Phone Number (10 digits)</Label>
              <Input
                id="phone"
                placeholder="9876543210"
                disabled={isSubmitting}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="role">ਰੋਲ / Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  disabled={isSubmitting}
                  {...register("role")}
                >
                  <option value="FARMER">ਕਿਸਾਨ / Farmer</option>
                  <option value="VET">ਡਾਕਟਰ / Vet</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="preferredLanguage">ਭਾਸ਼ਾ / Language</Label>
                <select
                  id="preferredLanguage"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  disabled={isSubmitting}
                  {...register("preferredLanguage")}
                >
                  <option value="PUNJABI">ਪੰਜਾਬੀ (Punjabi)</option>
                  <option value="HINGLISH">Hinglish</option>
                  <option value="HINDI">हिन्दी (Hindi)</option>
                  <option value="ENGLISH">English</option>
                </select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "ਰਜਿਸਟਰ ਹੋ ਰਿਹਾ ਹੈ... / Registering..." : "ਖਾਤਾ ਬਣਾਓ / Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="ml-1 text-primary hover:underline font-medium">
            ਲਾਗਇਨ ਕਰੋ / Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
