import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "../login/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Legal Prospector",
  description: "Create your account on the Legal Prospecting platform.",
};

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="app-wrapper" style={{ display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "60vh", maxWidth: "400px", margin: "auto" }}>
      <LoginForm mode="signup" />
    </div>
  );
}

