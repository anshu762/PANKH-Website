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
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Authentication failed. Please try again." };
      }
    }
    throw error;
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

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          role,
          phone: phone || null,
          preferredLanguage,
        },
      });

      // If user registered as a farmer, initialize the Farmer record
      if (role === "FARMER") {
        await tx.farmer.create({
          data: {
            userId: newUser.id,
            village: village || "Village",
            district: district || "District",
            state: state || "Punjab",
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to register user:", error);
    return { error: "Failed to create account. Please try again later." };
  }
}
