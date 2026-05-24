import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import { z } from "zod";
import { HttpError } from "../../lib/http-error.js";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/async-handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, "../../../uploads");

fs.mkdirSync(uploadsDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_request, _file, callback) => {
    callback(null, uploadsDirectory);
  },
  filename: (_request, file, callback) => {
    const extension = path.extname(file.originalname);
    const baseName = path
      .basename(file.originalname, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60);

    callback(null, `${Date.now()}-${baseName || "gambar"}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype.startsWith("image/")) {
      callback(null, true);
      return;
    }

    callback(new HttpError(400, "File harus berupa gambar"));
  },
});

export const uploadsRoutes = Router();
const deleteImageSchema = z.object({
  imageUrl: z.string().min(1),
});

uploadsRoutes.use(authenticate);

function resolveUploadFilePath(imageUrl) {
  if (!imageUrl.startsWith("/uploads/")) {
    return null;
  }

  const fileName = path.basename(imageUrl);
  const filePath = path.resolve(uploadsDirectory, fileName);

  if (!filePath.startsWith(uploadsDirectory)) {
    return null;
  }

  return filePath;
}

function uploadSingleImage(request, response, next) {
  upload.single("image")(request, response, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      next(new HttpError(400, "Ukuran file maksimal 20 MB"));
      return;
    }

    next(error);
  });
}

uploadsRoutes.post(
  "/image",
  uploadSingleImage,
  asyncHandler(async (request, response) => {
    if (!request.file) {
      throw new HttpError(400, "File gambar wajib dipilih");
    }

    response.status(201).json({
      fileName: request.file.filename,
      imageUrl: `/uploads/${request.file.filename}`,
    });
  }),
);

uploadsRoutes.delete(
  "/image",
  asyncHandler(async (request, response) => {
    const { imageUrl } = deleteImageSchema.parse(request.body);
    const filePath = resolveUploadFilePath(imageUrl);

    if (filePath) {
      fs.rmSync(filePath, { force: true });
    }

    response.json({
      message: "Gambar berhasil dihapus",
    });
  }),
);
