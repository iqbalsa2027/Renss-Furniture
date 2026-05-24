export type Category = {
  id: number;
  name: string;
  description?: string | null;
  sortOrder: number;
  isActive?: boolean;
};

export type Product = {
  id: number;
  categoryId?: number | null;
  categoryName?: string | null;
  name: string;
  description?: string | null;
  price: number;
  currencyCode: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  isPublished: boolean;
  isBestSeller?: boolean;
  stockStatus: "available" | "preorder" | "sold";
  sortOrder: number;
};

export type Testimonial = {
  id: number;
  customerName: string;
  quote: string;
  rating: number;
  imageUrl?: string | null;
  isPublished?: boolean;
  sortOrder: number;
};

export type AdminUser = {
  id: number;
  email: string;
  fullName: string;
};
