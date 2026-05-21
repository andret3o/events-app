"use client";

import { login, register } from "@/lib/api/auth";
import { ApiResponse } from "@/types/types";
import { InputHTMLAttributes, useState } from "react";
import { toast } from "sonner";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const GlassInput = ({ label, className = "", ...props }: GlassInputProps) => (
  <div className={`w-full space-y-2 ${className}`}>
    <label className="text-[9px] uppercase tracking-[0.25em] text-white/40 ml-4 font-mono">
      {label}
    </label>
    <input
      {...props}
      className="w-full h-12 md:h-14 px-6 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 backdrop-blur-md"
    />
  </div>
);

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [usernmae, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setLoading(true);
    const res: ApiResponse<void> =
      authMode === "login"
        ? await login({ username: usernmae, password: password })
        : await register({
            name: name,
            email: email,
            username: usernmae,
            password: password,
          });

    if (res.success) {
      toast.success(
        (authMode === "login" ? "Login " : "Sign up ") + "successful!",
        {
          position: "top-center",
        },
      );
    } else {
      toast.error(res.message, { position: "top-center" });
    }

    setLoading(false);
  }

  return (
    // Use min-h-[100dvh] to ensure the page works well with dynamic mobile keyboard heights
    <div className="min-h-[100dvh] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Main Container - Responsive width */}
      <div className="w-full max-w-[360px] md:max-w-md z-10 space-y-6 md:space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight">
            {authMode === "login" ? "Welcome back" : "Start your journey"}
          </h1>
          <p className="text-white/40 text-xs font-light">
            Enter your details to continue
          </p>
        </div>

        {/* The Sliding Toggle - Optimized for mobile tap targets */}
        <div className="relative w-full h-[52px] md:h-[60px] bg-white/5 border border-white/10 rounded-full p-1 flex items-center backdrop-blur-xl">
          <div
            className={`absolute h-[44px] md:h-[50px] w-[calc(50%-4px)] bg-white rounded-full transition-all duration-500 ease-out shadow-lg ${
              authMode === "login" ? "translate-x-0" : "translate-x-full"
            }`}
          />
          <button
            onClick={() => setAuthMode("login")}
            className={`relative z-10 flex-1 text-xs md:text-sm font-medium transition-colors duration-500 ${
              authMode === "login" ? "text-neutral-900" : "text-white/40"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setAuthMode("signup")}
            className={`relative z-10 flex-1 text-xs md:text-sm font-medium transition-colors duration-500 ${
              authMode === "signup" ? "text-neutral-900" : "text-white/40"
            }`}
          >
            Sign up
          </button>
        </div>

        {/* Form Area - Tightened padding for mobile */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.03] border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 backdrop-blur-2xl shadow-2xl space-y-4 md:space-y-6"
        >
          {authMode === "signup" && (
            <div className="space-y-4">
              <GlassInput
                label="Full Name"
                placeholder="John Doe"
                onChange={(e) => setName(e.target.value)}
              />
              <GlassInput
                label="Email address"
                placeholder="johndoe@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          <GlassInput
            label="Username"
            type="username"
            placeholder="john_doe"
            onChange={(e) => setUsername(e.target.value)}
          />
          <GlassInput
            label="Password"
            type="password"
            placeholder="••••••••"
            onChange={(e) => setPassword(e.target.value)}
          />

          {authMode === "login" && (
            <div className="flex justify-end px-4">
              <button
                type="button"
                className="text-[10px] text-white/30 uppercase tracking-wider font-mono"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            className="w-full h-12 md:h-14 bg-white text-neutral-900 rounded-full font-medium active:scale-[0.97] transition-all duration-300 shadow-xl mt-2"
            disabled={loading}
          >
            {!loading && (authMode === "login" ? "Sign In" : "Create Account")}
            {loading &&
              (authMode === "login" ? "Signing In..." : "Creating Account...")}
          </button>

          {/* Social Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 border-t border-white/5" />
            <span className="text-[9px] uppercase tracking-widest text-white/20">
              or
            </span>
            <div className="flex-1 border-t border-white/5" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <span className="text-[10px] uppercase font-bold tracking-widest">
                Google
              </span>
            </button>
            <button
              type="button"
              className="h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
            >
              <span className="text-[10px] uppercase font-bold tracking-widest">
                Apple
              </span>
            </button>
          </div>
        </form>

        {/* Footer Meta - Simplified for mobile */}
        <div className="text-center px-6">
          <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">
            By continuing you agree to our{" "}
            <span className="text-white/40">Terms</span>
          </p>
        </div>
      </div>
    </div>
  );
}
