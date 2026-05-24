"use client";

import { login, register } from "@/lib/api/auth";
import { ApiResponse } from "@/types/types";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// ─── GlassInput ───────────────────────────────────────────────────────────────

interface GlassInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
}

function GlassInput({ label, id, ...props }: GlassInputProps) {
  return (
    <div className="w-full space-y-2">
      <Label
        htmlFor={id}
        className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground ml-4 font-mono"
      >
        {label}
      </Label>
      <Input
        id={id}
        {...props}
        className="
          h-12 md:h-14 px-6 rounded-full
          bg-foreground/5 border-foreground/10
          placeholder:text-foreground/25
          focus-visible:border-foreground/30 focus-visible:bg-foreground/8
          focus-visible:ring-0
          transition-all duration-300
          text-foreground
        "
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res: ApiResponse<void> =
      authMode === "login"
        ? await login({ username, password })
        : await register({ name, email, username, password });

    if (res.success) {
      toast.success(
        (authMode === "login" ? "Login" : "Sign up") + " successful!",
        { position: "top-center" },
      );
    } else {
      toast.error(res.message, { position: "top-center" });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 pb-24 relative overflow-hidden font-sans">
      {/* ── Ambient background blobs ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/3 blur-[80px]" />
      </div>

      <div className="w-full max-w-[360px] md:max-w-md z-10 space-y-6 md:space-y-8">
        {/* ── Header ── */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            {authMode === "login" ? "Welcome back" : "Start your journey"}
          </h1>
          <p className="text-muted-foreground text-xs font-light">
            Enter your details to continue
          </p>
        </div>

        {/* ── Login / Sign up toggle ── */}
        <div className="relative w-full h-[52px] md:h-[60px] bg-foreground/5 border border-foreground/10 rounded-full p-1 flex items-center backdrop-blur-xl">
          {/* Sliding pill — primary token so it's always readable */}
          <div
            className={`
              absolute h-[44px] md:h-[50px] w-[calc(50%-4px)]
              bg-primary rounded-full
              transition-all duration-500 ease-out shadow-lg
              ${authMode === "login" ? "translate-x-0" : "translate-x-full"}
            `}
          />
          <button
            type="button"
            onClick={() => setAuthMode("login")}
            className={`
              relative z-10 flex-1 text-xs md:text-sm font-medium transition-colors duration-500
              ${authMode === "login" ? "text-primary-foreground" : "text-muted-foreground"}
            `}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setAuthMode("signup")}
            className={`
              relative z-10 flex-1 text-xs md:text-sm font-medium transition-colors duration-500
              ${authMode === "signup" ? "text-primary-foreground" : "text-muted-foreground"}
            `}
          >
            Sign up
          </button>
        </div>

        {/* ── Form card ── */}
        <form
          onSubmit={handleSubmit}
          className="
            glass-heavy
            rounded-[32px] md:rounded-[40px]
            p-6 md:p-8
            space-y-4 md:space-y-5
          "
        >
          {/* Sign-up only fields */}
          {authMode === "signup" && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <GlassInput
                id="name"
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
              <GlassInput
                id="email"
                label="Email address"
                type="email"
                placeholder="johndoe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          )}

          <GlassInput
            id="username"
            label="Username"
            placeholder="john_doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete={authMode === "login" ? "username" : "new-password"}
          />
          <GlassInput
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              authMode === "login" ? "current-password" : "new-password"
            }
          />

          {authMode === "login" && (
            <div className="flex justify-end px-1">
              <button
                type="button"
                className="text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-wider font-mono transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Primary submit button */}
          <Button
            type="submit"
            disabled={loading}
            className="
              w-full h-12 md:h-14 rounded-full
              font-medium text-sm
              transition-all duration-300
              active:scale-[0.97]
              mt-2
            "
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : authMode === "login" ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-1">
            <div className="flex-1 border-t border-foreground/8" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60">
              or
            </span>
            <div className="flex-1 border-t border-foreground/8" />
          </div>

          {/* Social buttons — use shadcn Button variant outline */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-foreground/10 bg-foreground/4 hover:bg-foreground/8 text-[10px] uppercase font-bold tracking-widest"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full border-foreground/10 bg-foreground/4 hover:bg-foreground/8 text-[10px] uppercase font-bold tracking-widest"
            >
              Apple
            </Button>
          </div>
        </form>

        {/* ── Footer ── */}
        <p className="text-center text-[9px] text-muted-foreground/60 uppercase tracking-[0.2em] px-6">
          By continuing you agree to our{" "}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
          >
            Terms
          </button>
        </p>
      </div>
    </div>
  );
}
