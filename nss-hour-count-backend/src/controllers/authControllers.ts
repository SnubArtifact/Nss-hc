import { Req, Res } from "../lib/types";

export const getAuthStatus = (req: Req, res: Res) => {
  if (req.user) {
    console.log(req.user);
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ message: "User not authenticated" });
  }
};

export const logout = (req: Req, res: Res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out." });
    }
    res.redirect("http://localhost:5173/");
  });
};
// Dev-only login bypass
import { prisma } from "../lib/prisma";

export const devLogin = async (req: Req, res: Res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: "Not available in production" });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Manually log the user in via Passport
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      return res.json({ message: "Logged in successfully", user });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal error" });
  }
};
