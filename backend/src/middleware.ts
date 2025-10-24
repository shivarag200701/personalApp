import type { Request, Response, NextFunction } from "express";

export function requireLogin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({
      msg: "Unauthorized. Please log in.",
    });
  }
}
