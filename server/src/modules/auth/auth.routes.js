import bcrypt from "bcryptjs";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../../config/env.js";
import { pool } from "../../db/pool.js";
import { HttpError } from "../../lib/http-error.js";
import { asyncHandler } from "../../utils/async-handler.js";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email admin belum diisi")
    .email("Format email admin belum valid"),
  password: z
    .string()
    .min(1, "Password admin belum diisi")
    .min(8, "Password admin minimal 8 karakter"),
});

export const authRoutes = Router();

authRoutes.post(
  "/login",
  asyncHandler(async (request, response) => {
    const parsedCredentials = loginSchema.safeParse(request.body);

    if (!parsedCredentials.success) {
      throw new HttpError(400, parsedCredentials.error.issues[0]?.message || "Data login admin belum valid");
    }

    const credentials = parsedCredentials.data;

    const result = await pool.query(
      `
        SELECT id_admin AS id, email, nama_lengkap, kata_sandi_hash
        FROM user_admin
        WHERE email = $1
      `,
      [credentials.email.toLowerCase()],
    );

    const user = result.rows[0];

    if (!user) {
      throw new HttpError(401, "Email admin tidak ditemukan");
    }

    const isMatch = await bcrypt.compare(credentials.password, user.kata_sandi_hash);

    if (!isMatch) {
      throw new HttpError(401, "Password admin salah");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        fullName: user.nama_lengkap,
      },
      env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    response.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.nama_lengkap,
      },
    });
  }),
);

authRoutes.get(
  "/bootstrap",
  asyncHandler(async (_request, response) => {
    const email = env.ADMIN_EMAIL.toLowerCase();
    const existing = await pool.query(
      "SELECT id_admin AS id FROM user_admin WHERE email = $1",
      [email],
    );

    if (existing.rowCount === 0) {
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
      await pool.query(
        `
          INSERT INTO user_admin (email, kata_sandi_hash, nama_lengkap)
          VALUES ($1, $2, $3)
        `,
        [email, passwordHash, "CMS Administrator"],
      );
    }

    response.json({
      message: "Admin bootstrap completed",
      email,
    });
  }),
);
