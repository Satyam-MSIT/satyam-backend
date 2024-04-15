import { RequestHandler } from "express";
import User from "../models/User";
import { authenticationError } from "../modules/account";
import { getStorage, setStorage } from "../modules/storage";
import { verifyToken } from "../modules/token";

const fetchuser: RequestHandler = async (req, res, next) => {
  try {
    const { id, tokenCreatedAt } = verifyToken(req.headers)!;
    let user: any = getStorage(`user-${id}`);
    if (!user) {
      user = await User.findById(id).select("name email type confirmed lastPasswordModifiedAt");
      if (user) setStorage(`user-${id}`, user);
      else return authenticationError(res);
    }
    if (user.lastPasswordModifiedAt > tokenCreatedAt) return authenticationError(res);
    req.id = id;
    req.user = user;
    next();
  } catch {
    authenticationError(res);
  }
};

export default fetchuser;
