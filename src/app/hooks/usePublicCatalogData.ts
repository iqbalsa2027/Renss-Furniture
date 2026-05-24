import { useEffect, useState } from "react";
import { publicApi } from "../lib/api";
import type { Category, Product, Testimonial } from "../types/cms";

type PublicCatalogState = {
  categories: Category[];
  products: Product[];
  testimonials: Testimonial[];
  loading: boolean;
  error: string | null;
};

const initialState: PublicCatalogState = {
  categories: [],
  products: [],
  testimonials: [],
  loading: true,
  error: null,
};

export function usePublicCatalogData() {
  const [state, setState] = useState<PublicCatalogState>(initialState);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [categories, products, testimonials] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getProducts(),
          publicApi.getTestimonials(),
        ]);

        if (!active) return;

        setState({
          categories,
          products,
          testimonials,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!active) return;

        setState({
          ...initialState,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load catalog data",
        });
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return {
    ...state,
    featuredProducts: state.products.slice(0, 4),
    bestSellerProducts: state.products.filter((product) => product.isBestSeller).slice(0, 6),
  };
}
