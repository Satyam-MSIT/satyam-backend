import { RequestHandler } from "express";
import User, { UserType } from "../models/User";
import { authenticationError } from "../modules/account";
import { getStorageAsync, setStorage } from "../modules/storage";
import { verifyToken } from "../modules/token";

export default function fetchuser(strict = true): RequestHandler {
  return async (req, res, next) => {
    try {
      const { id, tokenCreatedAt } = verifyToken(req.headers)!;
      let user: UserType = await getStorageAsync(`user-${id}`, async () => await User.findById(id).select("name email type confirmed lastPasswordModifiedAt"));
      if (!user) throw new Error("User not found");
      if (user.lastPasswordModifiedAt > tokenCreatedAt) throw new Error("Session expired");
      req.id = id;
      req.user = user;
      next();
    } catch {
      if (strict) authenticationError(res);
      else next();
    }
  };
}
