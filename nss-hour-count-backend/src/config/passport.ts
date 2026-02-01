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
        try {
          const user = await prisma.user.findUnique({
            where: { email: profile.emails[0].value },
          });

          if (user) {
            return done(null, user);
          }
          return done(null, false, { message: "User not found." });
        } catch (err) {
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
