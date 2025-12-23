import type { Request, Response, NextFunction } from "express";

export function requireLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Response<any, Record<string, any>> | void {
  // console.log("req.session", req.session);
  if (req.session?.userId) {
    next();
  } else {
     return res.status(401).json({
      isAuthenticated: "false",
    });
  }
}
