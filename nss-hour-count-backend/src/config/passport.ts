import { User } from "@prisma/client";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "../lib/prisma";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      if (profile && profile.emails && profile.emails[0]) {
        console.log("Google Auth Profile Email:", profile.emails[0].value);
        try {
          const user = await prisma.user.findUnique({
            where: { email: profile.emails[0].value },
          });

          if (user) {
            console.log("User found:", user.email);
            return done(null, user);
          }
          console.log("User not found in database.");
          return done(null, false, { message: "User not found." });
        } catch (err) {
          console.error("Error in Google Auth:", err);
          return done(err);
        }
      }
      return done(null, false, { message: "No email found in profile." });
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});
