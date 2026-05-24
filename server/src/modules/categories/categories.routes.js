import { Router } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { HttpError } from "../../lib/http-error.js";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/async-handler.js";

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

function getAdminId(request) {
  const adminId = Number(request.user?.sub);
  return Number.isFinite(adminId) ? adminId : null;
}

export const categoriesRoutes = Router();

categoriesRoutes.get(
  "/public",
  asyncHandler(async (_request, response) => {
    const result = await pool.query(
      `
        SELECT
          id_kategori AS id,
          nama AS name,
          deskripsi AS description,
          urutan AS "sortOrder"
        FROM kategori
        WHERE aktif = TRUE
        ORDER BY urutan ASC, id_kategori DESC
      `,
    );

    response.json(result.rows);
  }),
);

categoriesRoutes.use(authenticate);

categoriesRoutes.get(
  "/",
  asyncHandler(async (_request, response) => {
    const result = await pool.query(
      `
        SELECT
          id_kategori AS id,
          nama AS name,
          deskripsi AS description,
          urutan AS "sortOrder",
          aktif AS "isActive"
        FROM kategori
        ORDER BY urutan ASC, id_kategori DESC
      `,
    );

    response.json(result.rows);
  }),
);

categoriesRoutes.post(
  "/",
  asyncHandler(async (request, response) => {
    const data = categorySchema.parse(request.body);
    const adminId = getAdminId(request);

    const result = await pool.query(
      `
        INSERT INTO kategori (
          nama,
          deskripsi,
          urutan,
          aktif,
          dibuat_oleh,
          diubah_oleh
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          id_kategori AS id,
          nama AS name,
          deskripsi AS description,
          urutan AS "sortOrder",
          aktif AS "isActive"
      `,
      [data.name, data.description ?? null, data.sortOrder, data.isActive, adminId, adminId],
    );

    response.status(201).json(result.rows[0]);
  }),
);

categoriesRoutes.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const data = categorySchema.parse(request.body);
    const adminId = getAdminId(request);

    const result = await pool.query(
      `
        UPDATE kategori
        SET
          nama = $2,
          deskripsi = $3,
          urutan = $4,
          aktif = $5,
          diubah_oleh = $6
        WHERE id_kategori = $1
        RETURNING
          id_kategori AS id,
          nama AS name,
          deskripsi AS description,
          urutan AS "sortOrder",
          aktif AS "isActive"
      `,
      [Number(request.params.id), data.name, data.description ?? null, data.sortOrder, data.isActive, adminId],
    );

    if (result.rowCount === 0) {
      throw new HttpError(404, "Category not found");
    }

    response.json(result.rows[0]);
  }),
);

categoriesRoutes.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const result = await pool.query("DELETE FROM kategori WHERE id_kategori = $1", [Number(request.params.id)]);

    if (result.rowCount === 0) {
      throw new HttpError(404, "Category not found");
    }

    response.status(204).send();
  }),
);
