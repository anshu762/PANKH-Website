"use server";

import { signIn } from "@/auth";
import { prisma } from "@/lib/db";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function authenticate(data: LoginInput) {
  const validated = loginSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid form fields. Please check your input." };
  }

  const { email, password } = validated.data;

  try {
    if (!process.env.DATABASE_URL) {
      return {
        error:
          "Database not configured: Please set DATABASE_URL in Vercel Project Settings > Environment Variables.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { role: true },
    });

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true, role: user?.role };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Authentication failed. Please verify credentials or AUTH_SECRET in Vercel." };
      }
    }
    console.error("Authenticate error:", error);
    return { error: (error as any)?.message || "Authentication failed. Please try again." };
  }
}

export async function registerUser(data: RegisterInput) {
  const validated = registerSchema.safeParse(data);
  if (!validated.success) {
    return { error: "Invalid form fields. Please check your input." };
  }

  const { name, email, password, phone, role, preferredLanguage, village, district, state } =
    validated.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        name,
        role,
        phone: phone || null,
        preferredLanguage,
        ...(role === "FARMER"
          ? {
              farmer: {
                create: {
                  village: village || "Village",
                  district: district || "District",
                  state: state || "Punjab",
                },
              },
            }
          : {}),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to register user:", error);

    if (!process.env.DATABASE_URL) {
      return {
        error:
          "Database not configured: Please set DATABASE_URL in Vercel Project Settings > Environment Variables.",
      };
    }
    if (
      error?.code === "P1001" ||
      error?.message?.includes("Can't reach database server")
    ) {
      return {
        error:
          "Cannot reach database server. Please verify DATABASE_URL in Vercel Environment Variables.",
      };
    }
    if (error?.code === "P2021" || error?.message?.includes("does not exist")) {
      return {
        error:
          "Database tables not found. Please ensure database schema is deployed (prisma db push).",
      };
    }
    if (error?.code === "P2002") {
      return { error: "An account with this email already exists." };
    }

    return { error: error?.message || "Failed to create account. Please try again later." };
  }
}
