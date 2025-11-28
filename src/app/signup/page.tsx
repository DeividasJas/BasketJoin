"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import SocialLoginButtons from "@/components/SocialLoginButtons";

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

    // Validation
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
      // Register user
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

      // Auto-login after registration
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

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-zinc-300 bg-white p-8 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <h1 className="mb-6 text-center text-2xl font-bold">Join BasketJoin</h1>

        <SocialLoginButtons callbackUrl="/game-status" />

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="given_name"
                className="mb-2 block text-sm font-medium"
              >
                First Name
              </label>
              <input
                id="given_name"
                name="given_name"
                type="text"
                value={formData.given_name}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="First Name"
              />
            </div>

            <div>
              <label
                htmlFor="family_name"
                className="mb-2 block text-sm font-medium"
              >
                Last Name
              </label>
              <input
                id="family_name"
                name="family_name"
                type="text"
                value={formData.family_name}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-orange-600 hover:text-orange-700"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
