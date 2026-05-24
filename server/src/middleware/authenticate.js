import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../lib/http-error.js";

export function authenticate(request, _response, next) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Unauthorized"));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    request.user = payload;
    next();
  } catch {
    next(new HttpError(401, "Invalid token"));
  }
}
