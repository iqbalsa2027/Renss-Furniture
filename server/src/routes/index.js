import { authRoutes } from "../modules/auth/auth.routes.js";
import { categoriesRoutes } from "../modules/categories/categories.routes.js";
import { productsRoutes } from "../modules/products/products.routes.js";
import { testimonialsRoutes } from "../modules/testimonials/testimonials.routes.js";
import { uploadsRoutes } from "../modules/uploads/uploads.routes.js";

export function registerRoutes(app) {
  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/uploads", uploadsRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/products", productsRoutes);
  app.use("/api/testimonials", testimonialsRoutes);
}
