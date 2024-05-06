import { RequestHandler } from "express";
import User, { UserType } from "../models/User";
import { authenticationError } from "../modules/account";
import { getStorageAsync } from "../modules/storage";
import { verifyToken } from "../modules/token";

export default function fetchuser(strict = true): RequestHandler {
  return async (req, res, next) => {
    try {
      const { id, tokenCreatedAt } = verifyToken(req.headers)!;
      let user = await getStorageAsync(`user-${id}`, async () => await User.findById(id).select("name email type active confirmed lastPasswordModifiedAt"));
      if (!user) throw new Error("User not found");
      if (!user.active) return authenticationError(res);
      if (user.lastPasswordModifiedAt > tokenCreatedAt) throw new Error("Session expired");
      req.id = id;
      req.user = user;
      next();
    } catch {
      if (strict) authenticationError(res, "Session expired! Please login again.");
      else next();
    }
  };
}
