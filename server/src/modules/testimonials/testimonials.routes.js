import { Router } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { HttpError } from "../../lib/http-error.js";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/async-handler.js";

const testimonialSchema = z.object({
  customerName: z.string().min(2),
  quote: z.string().min(10),
  rating: z.number().int().min(1).max(5).default(5),
  imageUrl: z.string().min(1).nullable().optional(),
  isPublished: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

function getAdminId(request) {
  const adminId = Number(request.user?.sub);
  return Number.isFinite(adminId) ? adminId : null;
}

export const testimonialsRoutes = Router();

testimonialsRoutes.get(
  "/public",
  asyncHandler(async (_request, response) => {
    const result = await pool.query(
      `
        SELECT
          id_testimoni AS id,
          nama_pelanggan AS "customerName",
          kutipan AS quote,
          rating,
          gambar AS "imageUrl",
          urutan AS "sortOrder"
        FROM testimoni
        WHERE publikasi = TRUE
        ORDER BY urutan ASC, create_add DESC
      `,
    );

    response.json(result.rows);
  }),
);

testimonialsRoutes.use(authenticate);

testimonialsRoutes.get(
  "/",
  asyncHandler(async (_request, response) => {
    const result = await pool.query(
      `
        SELECT
          id_testimoni AS id,
          nama_pelanggan AS "customerName",
          kutipan AS quote,
          rating,
          gambar AS "imageUrl",
          publikasi AS "isPublished",
          urutan AS "sortOrder",
          create_add AS "createdAt",
          update_add AS "updatedAt"
        FROM testimoni
        ORDER BY urutan ASC, create_add DESC
      `,
    );

    response.json(result.rows);
  }),
);

testimonialsRoutes.post(
  "/",
  asyncHandler(async (request, response) => {
    const data = testimonialSchema.parse(request.body);
    const adminId = getAdminId(request);

    const result = await pool.query(
      `
        INSERT INTO testimoni (
          nama_pelanggan,
          kutipan,
          rating,
          gambar,
          publikasi,
          urutan,
          dibuat_oleh,
          diubah_oleh
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id_testimoni AS id,
          nama_pelanggan AS "customerName",
          kutipan AS quote,
          rating,
          gambar AS "imageUrl",
          publikasi AS "isPublished",
          urutan AS "sortOrder",
          create_add AS "createdAt",
          update_add AS "updatedAt"
      `,
      [
        data.customerName,
        data.quote,
        data.rating,
        data.imageUrl ?? null,
        data.isPublished,
        data.sortOrder,
        adminId,
        adminId,
      ],
    );

    response.status(201).json(result.rows[0]);
  }),
);

testimonialsRoutes.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const data = testimonialSchema.parse(request.body);
    const adminId = getAdminId(request);

    const result = await pool.query(
      `
        UPDATE testimoni
        SET
          nama_pelanggan = $2,
          kutipan = $3,
          rating = $4,
          gambar = $5,
          publikasi = $6,
          urutan = $7,
          diubah_oleh = $8,
          update_add = NOW()
        WHERE id_testimoni = $1
        RETURNING
          id_testimoni AS id,
          nama_pelanggan AS "customerName",
          kutipan AS quote,
          rating,
          gambar AS "imageUrl",
          publikasi AS "isPublished",
          urutan AS "sortOrder",
          create_add AS "createdAt",
          update_add AS "updatedAt"
      `,
      [
        Number(request.params.id),
        data.customerName,
        data.quote,
        data.rating,
        data.imageUrl ?? null,
        data.isPublished,
        data.sortOrder,
        adminId,
      ],
    );

    if (result.rowCount === 0) {
      throw new HttpError(404, "Testimonial not found");
    }

    response.json(result.rows[0]);
  }),
);

testimonialsRoutes.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const result = await pool.query("DELETE FROM testimoni WHERE id_testimoni = $1", [Number(request.params.id)]);

    if (result.rowCount === 0) {
      throw new HttpError(404, "Testimonial not found");
    }

    response.status(204).send();
  }),
);
