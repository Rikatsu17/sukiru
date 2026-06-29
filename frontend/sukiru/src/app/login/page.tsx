"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { CreditStamp } from "@/components/CreditStamp";
import { Button } from "@/components/Button";
import { TextField, TextAreaField } from "@/components/Field";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { ApiError } from "@/lib/api";

type Mode = "login" | "register";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await login({
        email: String(form.get("email") || "").trim(),
        password: String(form.get("password") || ""),
      });
      showToast("Welcome back.", "success");
      router.push("/app");
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Couldn't sign you in.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await register({
        full_name: String(form.get("full_name") || "").trim(),
        email: String(form.get("email") || "").trim(),
        password: String(form.get("password") || ""),
        bio: String(form.get("bio") || "").trim(),
        faculty: String(form.get("faculty") || "").trim(),
        course: String(form.get("course") || "").trim(),
        avatar_url: String(form.get("avatar_url") || "").trim() || null,
      });
      showToast("Account created. Sign in to get your first credits.", "success");
      setMode("login");
      (event.currentTarget as HTMLFormElement).reset();
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Couldn't create your account.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <CreditStamp size="sm" className="mb-4" />
            <h1 className="font-display text-3xl font-medium">
              {mode === "login" ? "Welcome back" : "Open your ledger"}
            </h1>
            <p className="text-stone text-sm mt-2">
              {mode === "login"
                ? "Sign in to see your tasks, applications, and balance."
                : "One account, one balance, every trade tracked."}
            </p>
          </div>

          <div className="bg-white border border-rule rounded-xl overflow-hidden">
            <div className="flex border-b border-rule">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === "login" ? "text-ink border-b-2 border-stamp-dark" : "text-stone hover:text-ink"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  mode === "register" ? "text-ink border-b-2 border-stamp-dark" : "text-stone hover:text-ink"
                }`}
              >
                Create account
              </button>
            </div>

            <div className="p-6">
              {mode === "login" ? (
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <TextField label="Email" name="email" type="email" required autoComplete="email" />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="current-password"
                  />
                  <Button type="submit" disabled={isSubmitting} className="mt-2">
                    {isSubmitting ? "Signing in…" : "Sign in"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <TextField label="Full name" name="full_name" required minLength={2} autoComplete="name" />
                  <TextField label="Email" name="email" type="email" required autoComplete="email" />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    hint="At least 8 characters."
                    autoComplete="new-password"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextField label="Faculty" name="faculty" placeholder="e.g. Computer Science" />
                    <TextField label="Course" name="course" placeholder="e.g. 3rd year" />
                  </div>
                  <TextAreaField
                    label="Bio"
                    name="bio"
                    rows={3}
                    maxLength={500}
                    placeholder="What can you help with? What are you hoping to learn?"
                  />
                  <TextField label="Avatar URL" name="avatar_url" type="url" placeholder="Optional" />
                  <Button type="submit" disabled={isSubmitting} className="mt-2">
                    {isSubmitting ? "Creating account…" : "Create account"}
                  </Button>
                </form>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-stone mt-6">
            <Link href="/" className="underline underline-offset-4 hover:text-ink">
              Back to the front page
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
