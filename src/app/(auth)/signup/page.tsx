"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    given_name: "",
    family_name: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          given_name: formData.given_name,
          family_name: formData.family_name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Registration successful, but login failed. Please try logging in.",
        );
      } else {
        router.push("/game-status");
        router.refresh();
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-basket-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:bg-zinc-800";

  return (
    <>
      {/* Branding */}
      <Link
        href="/"
        className="mb-10 flex flex-col items-center gap-3 transition-opacity hover:opacity-80"
      >
        <Image
          src="/basketball.svg"
          width={44}
          height={44}
          alt="BasketJoin"
          priority
        />
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
          BasketJoin
        </span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700/60 dark:bg-zinc-900">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              Create an account
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Join BasketJoin and find your next game
            </p>
          </div>

          <SocialLoginButtons callbackUrl="/game-status" />

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="given_name"
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400"
                >
                  First Name
                </label>
                <input
                  id="given_name"
                  name="given_name"
                  type="text"
                  value={formData.given_name}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="First"
                />
              </div>

              <div>
                <label
                  htmlFor="family_name"
                  className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400"
                >
                  Last Name
                </label>
                <input
                  id="family_name"
                  name="family_name"
                  type="text"
                  value={formData.family_name}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="Last"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="••••••••"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={inputClasses}
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full bg-basket-400 py-5 text-white shadow-sm transition-all hover:bg-basket-300 hover:shadow-md disabled:bg-basket-400/40"
            >
              Create account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-[13px] text-zinc-500 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-basket-400 transition-colors hover:text-basket-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
