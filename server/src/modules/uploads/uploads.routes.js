import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import { z } from "zod";
import { env } from "../../config/env.js";
import { HttpError } from "../../lib/http-error.js";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/async-handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, "../../../uploads");

fs.mkdirSync(uploadsDirectory, { recursive: true });

const hasCloudinaryConfig = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

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
  storage: hasCloudinaryConfig ? multer.memoryStorage() : storage,
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

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "renss-furniture",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    uploadStream.end(file.buffer);
  });
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

    if (hasCloudinaryConfig) {
      const result = await uploadToCloudinary(request.file);

      response.status(201).json({
        fileName: result.public_id,
        imageUrl: result.secure_url,
      });

      return;
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

    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      if (hasCloudinaryConfig && imageUrl.includes("res.cloudinary.com")) {
        const match = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
        const publicId = match?.[1];

        if (publicId) {
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => undefined);
        }
      }

      response.json({
        message: "Gambar berhasil dihapus",
      });

      return;
    }

    const filePath = resolveUploadFilePath(imageUrl);

    if (filePath) {
      fs.rmSync(filePath, { force: true });
    }

    response.json({
      message: "Gambar berhasil dihapus",
    });
  }),
);
