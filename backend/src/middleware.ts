import type { Request, Response, NextFunction } from "express";

export function requireLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.log("session", req.session);
  console.log("cookies", req.headers.cookie)
  if (req.session?.userId) {
    next();
  } else {
    res.status(401).json({
      isAuthenticated: "false",
    });
  }
}
