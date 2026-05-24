import { ZodError } from "zod";

export function errorHandler(error, _request, response, _next) {
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message || "Data request belum valid";

    return response.status(400).json({
      message,
    });
  }

  const statusCode = error.statusCode ?? 500;
  const message = statusCode >= 500 ? "Internal server error" : error.message;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode).json({
    message,
  });
}
