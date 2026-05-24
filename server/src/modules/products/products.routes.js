import { Router } from "express";
import { z } from "zod";
import { pool } from "../../db/pool.js";
import { HttpError } from "../../lib/http-error.js";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/async-handler.js";

const productSchema = z.object({
  categoryId: z.union([z.coerce.number().int(), z.null()]).optional(),
  name: z.string().min(2),
  description: z.string().nullable().optional(),
  price: z.coerce.number().nonnegative(),
  currencyCode: z.string().length(3).default("IDR"),
  imageUrl: z.string().min(1).nullable().optional(),
  imageUrls: z.array(z.string().min(1)).optional(),
  isPublished: z.boolean().default(true),
  isBestSeller: z.boolean().default(false),
  stockStatus: z.enum(["available", "preorder", "sold"]).default("available"),
  sortOrder: z.number().int().default(0),
});

function getAdminId(request) {
  const adminId = Number(request.user?.sub);
  return Number.isFinite(adminId) ? adminId : null;
}

const publicSelect = `
  SELECT
    p.id_produk AS id,
    p.id_kategori AS "categoryId",
    c.nama AS "categoryName",
    p.nama AS name,
    p.deskripsi AS description,
    CAST(p.harga AS DOUBLE PRECISION) AS price,
    p.kode_mata_uang AS "currencyCode",
    CASE
      WHEN jsonb_typeof(p.gambar_produk) = 'array' AND jsonb_array_length(p.gambar_produk) > 0
        THEN p.gambar_produk->>0
      ELSE NULL
    END AS "imageUrl",
    CASE
      WHEN jsonb_typeof(p.gambar_produk) = 'array'
        THEN p.gambar_produk
      ELSE '[]'::jsonb
    END AS "imageUrls",
    p.publikasi AS "isPublished",
    p.best_seller AS "isBestSeller",
    p.status_stok AS "stockStatus",
    p.urutan AS "sortOrder",
    p.create_add AS "createdAt",
    p.update_add AS "updatedAt"
  FROM produk p
  LEFT JOIN kategori c ON c.id_kategori = p.id_kategori
`;

function normalizeProductImages(data) {
  if (data.imageUrls && data.imageUrls.length > 0) {
    return data.imageUrls;
  }

  if (data.imageUrl) {
    return [data.imageUrl];
  }

  return [];
}

export const productsRoutes = Router();

productsRoutes.get(
  "/public",
  asyncHandler(async (_request, response) => {
    const result = await pool.query(
      `
        ${publicSelect}
        WHERE p.publikasi = TRUE
        ORDER BY p.urutan ASC, p.update_add DESC, p.id_produk DESC
      `,
    );

    response.json(result.rows);
  }),
);

productsRoutes.use(authenticate);

productsRoutes.get(
  "/",
  asyncHandler(async (_request, response) => {
    const result = await pool.query(
      `
        ${publicSelect}
        ORDER BY p.urutan ASC, p.update_add DESC, p.id_produk DESC
      `,
    );

    response.json(result.rows);
  }),
);

productsRoutes.post(
  "/",
  asyncHandler(async (request, response) => {
    const data = productSchema.parse(request.body);
    const adminId = getAdminId(request);
    const imageUrls = normalizeProductImages(data);
    const inserted = await pool.query(
      `
        INSERT INTO produk (
          id_kategori,
          nama,
          deskripsi,
          harga,
          kode_mata_uang,
          gambar_produk,
          publikasi,
          best_seller,
          status_stok,
          urutan,
          dibuat_oleh,
          diubah_oleh
        )
        VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10, $11, $12)
        RETURNING id_produk AS id
      `,
      [
        data.categoryId ?? null,
        data.name,
        data.description ?? null,
        data.price,
        data.currencyCode.toUpperCase(),
        JSON.stringify(imageUrls),
        data.isPublished,
        data.isBestSeller,
        data.stockStatus,
        data.sortOrder,
        adminId,
        adminId,
      ],
    );

    const productId = inserted.rows[0].id;
    const result = await pool.query(
      `
        ${publicSelect}
        WHERE p.id_produk = $1
      `,
      [productId],
    );

    response.status(201).json(result.rows[0]);
  }),
);

productsRoutes.put(
  "/:id",
  asyncHandler(async (request, response) => {
    const data = productSchema.parse(request.body);
    const adminId = getAdminId(request);
    const imageUrls = normalizeProductImages(data);
    const updated = await pool.query(
      `
        UPDATE produk
        SET
          id_kategori = $2,
          nama = $3,
          deskripsi = $4,
          harga = $5,
          kode_mata_uang = $6,
          gambar_produk = $7::jsonb,
          publikasi = $8,
          best_seller = $9,
          status_stok = $10,
          urutan = $11,
          diubah_oleh = $12,
          update_add = NOW()
        WHERE id_produk = $1
        RETURNING id_produk AS id
      `,
      [
        Number(request.params.id),
        data.categoryId ?? null,
        data.name,
        data.description ?? null,
        data.price,
        data.currencyCode.toUpperCase(),
        JSON.stringify(imageUrls),
        data.isPublished,
        data.isBestSeller,
        data.stockStatus,
        data.sortOrder,
        adminId,
      ],
    );

    if (updated.rowCount === 0) {
      throw new HttpError(404, "Product not found");
    }

    const result = await pool.query(
      `
        ${publicSelect}
        WHERE p.id_produk = $1
      `,
      [Number(request.params.id)],
    );

    response.json(result.rows[0]);
  }),
);

productsRoutes.delete(
  "/:id",
  asyncHandler(async (request, response) => {
    const result = await pool.query("DELETE FROM produk WHERE id_produk = $1", [Number(request.params.id)]);

    if (result.rowCount === 0) {
      throw new HttpError(404, "Product not found");
    }

    response.status(204).send();
  }),
);
