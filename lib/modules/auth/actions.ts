"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "./index";

export async function loginAction(
  _prev: string | undefined,
  formData: FormData,
): Promise<string | undefined> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/panel",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Credenciales incorrectas";
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
