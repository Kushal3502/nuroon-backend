import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const errorMiddleware =  (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return res.send(new ApiError(500, err.message || "Something went wrong"));
};
