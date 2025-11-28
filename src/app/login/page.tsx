"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SocialLoginButtons from "@/components/SocialLoginButtons";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
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
        <h1 className="mb-6 text-center text-2xl font-bold">Login to BasketJoin</h1>

        <SocialLoginButtons callbackUrl="/game-status" />

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
