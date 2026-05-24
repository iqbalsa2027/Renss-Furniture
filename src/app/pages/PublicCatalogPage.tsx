import { AboutBrand } from "../components/AboutBrand";
import { BestSellers } from "../components/BestSellers";
import { CTASection } from "../components/CTASection";
import { FeaturedProducts } from "../components/FeaturedProducts";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { Testimonials } from "../components/Testimonials";
import { WhatsAppFloatButton } from "../components/WhatsAppFloatButton";
import { WhyChooseUs } from "../components/WhyChooseUs";
import { usePublicCatalogData } from "../hooks/usePublicCatalogData";

export function PublicCatalogPage() {
  const {
    categories,
    featuredProducts,
    bestSellerProducts,
    testimonials,
    loading,
    error,
  } = usePublicCatalogData();

  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <AboutBrand />
      <FeaturedProducts products={featuredProducts} loading={loading} error={error} />
      <WhyChooseUs />
      <BestSellers products={bestSellerProducts} loading={loading} error={error} />
      <Testimonials testimonials={testimonials} loading={loading} error={error} />
      <CTASection />
      <Footer categories={categories} loading={loading} />
      <WhatsAppFloatButton />
    </div>
  );
}
