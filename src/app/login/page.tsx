import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "./LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Legal Prospector",
  description: "Sign in to your account on the Legal Prospecting platform.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="app-wrapper" style={{ justifyContent: "center", minHeight: "60vh", maxWidth: "480px" }}>
      <header className="header" style={{ marginBottom: "2rem" }}>
        <h1 className="title">Legal Prospector</h1>
        <p className="subtitle">Sign in to manage your prospecting database.</p>
      </header>
      <LoginForm />
    </div>
  );
}
