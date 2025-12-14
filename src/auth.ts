import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.users.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!passwordMatch) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.given_name || ""} ${user.family_name || ""}`.trim(),
          image: user.picture,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For OAuth providers (Google, Facebook), create or update user in database
      if (account?.provider === "google" || account?.provider === "facebook") {
        try {
          const email = user.email;
          if (!email) {
            return false;
          }

          // Check if user exists
          let existingUser = await prisma.users.findUnique({
            where: { email },
          });

          if (!existingUser) {
            // Create new user from OAuth profile
            const names = (user.name || "").split(" ");
            const given_name = names[0] || "";
            const family_name = names.slice(1).join(" ") || "";

            existingUser = await prisma.users.create({
              data: {
                email,
                given_name,
                family_name,
                picture: user.image || "",
                password: null, // OAuth users don't have passwords
              },
            });
          } else if (user.image && !existingUser.picture) {
            // Update user's profile picture if they don't have one
            await prisma.users.update({
              where: { id: existingUser.id },
              data: { picture: user.image },
            });
          }

          // Store the database user ID for use in JWT
          user.id = existingUser.id;
          return true;
        } catch (error) {
          return false;
        }
      }

      // For credentials provider, user is already validated
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.picture = user.image;
      }

      // Fetch user role from database if not already in token
      if (token.id && !token.role) {
        const dbUser = await prisma.users.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        token.role = dbUser?.role || "PLAYER";
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
