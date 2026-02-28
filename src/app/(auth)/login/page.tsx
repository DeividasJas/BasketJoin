"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import SocialLoginButtons from "@/components/SocialLoginButtons";
import { Button } from "@/components/ui/button";

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.4, 0.25, 1] },
  },
};

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

  const inputClasses =
    "w-full rounded-xl border pl-11 pr-4 py-3 text-sm transition-all bg-zinc-100/80 border-zinc-200/80 text-zinc-800 placeholder:text-zinc-400 focus:border-basket-400/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-basket-400/15 dark:bg-zinc-800/50 dark:border-zinc-700/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-basket-400/40 dark:focus:bg-zinc-800/80 dark:focus:ring-basket-400/10";

  return (
    <>
      {/* Branding */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link
          href="/"
          className="mb-10 flex flex-col items-center gap-3.5 transition-opacity hover:opacity-80"
        >
          <div className="rounded-2xl bg-gradient-to-br from-basket-300 to-basket-500 p-3.5 shadow-lg shadow-basket-500/25">
            <Image
              src="/basketball.svg"
              width={28}
              height={28}
              alt="BasketJoin"
              priority
              className="brightness-0 invert"
            />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">
            BasketJoin
          </span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        className="w-full max-w-[400px]"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        <div className="rounded-2xl border border-zinc-200/60 bg-white/85 p-7 shadow-xl shadow-zinc-900/[0.04] backdrop-blur-xl dark:border-zinc-700/30 dark:bg-zinc-900/60 dark:shadow-2xl dark:shadow-black/30">
          <motion.div className="mb-7" variants={fadeUp}>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back
            </h1>
            <p className="mt-1.5 text-[13px] text-zinc-500 dark:text-zinc-400">
              Sign in to find your next game
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <SocialLoginButtons callbackUrl="/game-status" />
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-red-200/80 bg-red-50/80 px-4 py-3 text-[13px] text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <motion.form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3.5"
            variants={fadeUp}
          >
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClasses}
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClasses}
                placeholder="Password"
              />
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              className="mt-1.5 h-12 w-full rounded-xl bg-gradient-to-r from-basket-400 to-basket-500 text-[13px] font-semibold text-white shadow-lg shadow-basket-500/20 transition-all hover:from-basket-300 hover:to-basket-400 hover:shadow-basket-400/30 active:scale-[0.98] disabled:opacity-60 disabled:shadow-none"
            >
              Sign in
            </Button>
          </motion.form>
        </div>

        <motion.p
          className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400"
          variants={fadeUp}
        >
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-basket-400 transition-colors hover:text-basket-300"
          >
            Create one
          </Link>
        </motion.p>
      </motion.div>
    </>
  );
}
