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
