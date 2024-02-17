import { RequestHandler } from "express";
import User from "../models/User";
import { authenticationError } from "../modules/account";
import { getStorage, setStorage } from "../modules/storage";
import { verifyToken } from "../modules/token";

const fetchuser: RequestHandler = async (req, res, next) => {
  try {
    const { id } = verifyToken(req.headers)!;
    if (!getStorage(`user-${id}`)) {
      if (await User.exists({ _id: id })) setStorage(`user-${id}`, true);
      else return authenticationError(res);
    }
    req.id = id;
    next();
  } catch {
    authenticationError(res);
  }
};

export default fetchuser;
