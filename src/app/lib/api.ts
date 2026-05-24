import type {
  AdminUser,
  Category,
  Product,
  Testimonial,
} from "../types/cms";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const publicApi = {
  getCategories: () => apiFetch<Category[]>("/api/categories/public"),
  getProducts: () => apiFetch<Product[]>("/api/products/public"),
  getTestimonials: () => apiFetch<Testimonial[]>("/api/testimonials/public"),
};

export const adminApi = {
  bootstrapAdmin: () => apiFetch<{ message: string; email: string }>("/api/auth/bootstrap"),
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: AdminUser }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getCategories: (token: string) => apiFetch<Category[]>("/api/categories", {}, token),
  createCategory: (payload: Partial<Category>, token: string) =>
    apiFetch<Category>(
      "/api/categories",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  updateCategory: (id: number, payload: Partial<Category>, token: string) =>
    apiFetch<Category>(
      `/api/categories/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token,
    ),
  deleteCategory: (id: number, token: string) =>
    apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" }, token),
  getProducts: (token: string) => apiFetch<Product[]>("/api/products", {}, token),
  createProduct: (payload: Partial<Product>, token: string) =>
    apiFetch<Product>(
      "/api/products",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  updateProduct: (id: number, payload: Partial<Product>, token: string) =>
    apiFetch<Product>(
      `/api/products/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token,
    ),
  deleteProduct: (id: number, token: string) =>
    apiFetch<void>(`/api/products/${id}`, { method: "DELETE" }, token),
  uploadImage: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append("image", file);

    return apiFetch<{ fileName: string; imageUrl: string }>(
      "/api/uploads/image",
      { method: "POST", body: formData },
      token,
    );
  },
  deleteImage: (imageUrl: string, token: string) =>
    apiFetch<{ message: string }>(
      "/api/uploads/image",
      { method: "DELETE", body: JSON.stringify({ imageUrl }) },
      token,
    ),
  getTestimonials: (token: string) => apiFetch<Testimonial[]>("/api/testimonials", {}, token),
  createTestimonial: (payload: Partial<Testimonial>, token: string) =>
    apiFetch<Testimonial>(
      "/api/testimonials",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  updateTestimonial: (id: number, payload: Partial<Testimonial>, token: string) =>
    apiFetch<Testimonial>(
      `/api/testimonials/${id}`,
      { method: "PUT", body: JSON.stringify(payload) },
      token,
    ),
  deleteTestimonial: (id: number, token: string) =>
    apiFetch<void>(`/api/testimonials/${id}`, { method: "DELETE" }, token),
};
