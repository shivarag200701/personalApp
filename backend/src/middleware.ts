import type { Request, Response, NextFunction } from "express";

export function requireLogin(
  req: Request,
  res: Response,
  next: NextFunction
): Response<any, Record<string, any>> | void {
  console.log("req.session?.userId", req.session?.userId);
  if (req.session?.userId) {
    console.log("user is authenticated");
    next();
  } else {
    console.log("user is not authenticated");
     return res.status(401).json({
      isAuthenticated: "false",
    });
  }
}
