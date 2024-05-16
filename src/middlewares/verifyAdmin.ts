import { Request, RequestHandler } from "express";
import { authenticationError } from "../modules/account";

type ConditionFunction = (req: Request) => boolean;

export default function verifyAdmin(authCondition?: ConditionFunction): RequestHandler {
  return async (req, res, next) => {
    try {
      if (req.user?.type === "satyam-admin" || authCondition?.(req)) return next();
      authenticationError(res);
    } catch {
      authenticationError(res);
    }
  };
}
