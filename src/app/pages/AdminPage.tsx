import {
  AlertTriangle,
  LockKeyhole,
  LogOut,
  MessageSquareQuote,
  Package,
  Pencil,
  Shapes,
  Trash2,
  WifiOff,
} from "lucide-react";
import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { adminApi } from "../lib/api";
import { resolveAssetUrl } from "../lib/assets";
import { formatCurrency } from "../lib/format";
import type { AdminUser, Category, Product, Testimonial } from "../types/cms";

const TOKEN_KEY = "renss-cms-token";
const USER_KEY = "renss-cms-user";
const INACTIVITY_LOGOUT_MS = 30 * 60 * 1000;

type AdminTab = "products" | "categories" | "testimonials";

type CategoryFormState = {
  id?: number;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
};

type ProductFormState = {
  id?: number;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  currencyCode: string;
  imageUrls: string[];
  isPublished: boolean;
  isBestSeller: boolean;
  stockStatus: "available" | "preorder" | "sold";
  sortOrder: number;
};

type TestimonialFormState = {
  id?: number;
  customerName: string;
  quote: string;
  rating: number;
  imageUrl: string;
  isPublished: boolean;
  sortOrder: number;
};

type LoginAlert = {
  title: string;
  description: string;
  tips: string[];
  icon: typeof AlertTriangle;
};

const emptyCategoryForm: CategoryFormState = {
  name: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

const emptyProductForm: ProductFormState = {
  categoryId: "",
  name: "",
  description: "",
  price: 0,
  currencyCode: "IDR",
  imageUrls: [],
  isPublished: true,
  isBestSeller: false,
  stockStatus: "available",
  sortOrder: 0,
};

const emptyTestimonialForm: TestimonialFormState = {
  customerName: "",
  quote: "",
  rating: 5,
  imageUrl: "",
  isPublished: true,
  sortOrder: 0,
};

function readStoredToken() {
  return window.localStorage.getItem(TOKEN_KEY);
}

function readStoredUser() {
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

function buildLoginAlert(message: string): LoginAlert {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("internal server error")) {
    return {
      title: "Server admin sedang bermasalah",
      description: "Sistem login berhasil terhubung, tetapi backend menemui kendala saat memproses permintaan Anda.",
      tips: [
        "Pastikan backend server masih berjalan di port 4000.",
        "Periksa koneksi database PostgreSQL dan query login admin.",
        "Coba lagi beberapa detik lagi setelah server stabil.",
      ],
      icon: AlertTriangle,
    };
  }

  if (
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("load failed")
  ) {
    return {
      title: "Tidak bisa terhubung ke server",
      description: "Halaman admin tidak dapat menjangkau backend API saat ini.",
      tips: [
        "Pastikan backend sudah dijalankan.",
        "Cek apakah URL API masih mengarah ke server yang benar.",
        "Refresh halaman setelah backend kembali aktif.",
      ],
      icon: WifiOff,
    };
  }

  if (
    normalizedMessage.includes("invalid credentials") ||
    normalizedMessage.includes("email atau password") ||
    normalizedMessage.includes("unauthorized")
  ) {
    return {
      title: "Email atau password belum cocok",
      description: "Periksa kembali akun admin yang Anda gunakan untuk masuk.",
      tips: [
        "Pastikan email admin sudah benar.",
        "Gunakan password asli, bukan hash bcrypt.",
        "Password admin minimal 8 karakter.",
      ],
      icon: AlertTriangle,
    };
  }

  if (normalizedMessage.includes("email admin tidak ditemukan")) {
    return {
      title: "Email admin tidak ditemukan",
      description: "Akun dengan email tersebut belum terdaftar di sistem admin.",
      tips: [
        "Periksa kembali penulisan email admin.",
        "Pastikan akun admin sudah dibuat di tabel user_admin.",
      ],
      icon: AlertTriangle,
    };
  }

  if (normalizedMessage.includes("password admin salah")) {
    return {
      title: "Password admin salah",
      description: "Email admin sudah ditemukan, tetapi password yang dimasukkan belum cocok.",
      tips: [
        "Gunakan password asli, bukan hash bcrypt.",
        "Periksa huruf besar, kecil, dan karakter khusus pada password.",
        "Jika lupa, update kata_sandi_hash user admin di database.",
      ],
      icon: AlertTriangle,
    };
  }

  if (normalizedMessage.includes("email admin belum diisi")) {
    return {
      title: "Email admin masih kosong",
      description: "Isi email admin terlebih dahulu sebelum mencoba masuk ke dashboard.",
      tips: [
        "Masukkan email admin yang terdaftar.",
        "Pastikan tidak ada spasi tambahan di awal atau akhir email.",
      ],
      icon: AlertTriangle,
    };
  }

  if (normalizedMessage.includes("format email admin belum valid")) {
    return {
      title: "Format email belum benar",
      description: "Email yang dimasukkan belum sesuai format standar alamat email.",
      tips: [
        "Gunakan format seperti admin@renssfurniture.com.",
        "Periksa kembali tanda @ dan domain email.",
      ],
      icon: AlertTriangle,
    };
  }

  if (normalizedMessage.includes("password admin belum diisi")) {
    return {
      title: "Password admin masih kosong",
      description: "Anda perlu mengisi password admin sebelum login dapat diproses.",
      tips: [
        "Masukkan password admin yang sudah dibuat.",
        "Pastikan kolom password tidak kosong.",
      ],
      icon: AlertTriangle,
    };
  }

  if (normalizedMessage.includes("at least 8 character")) {
    return {
      title: "Password terlalu pendek",
      description: "Sandi admin harus berisi minimal 8 karakter agar lolos validasi login.",
      tips: [
        "Gunakan password admin yang panjangnya minimal 8 karakter.",
        "Jika lupa, buat hash baru lalu update user admin di database.",
      ],
      icon: AlertTriangle,
    };
  }

  return {
    title: "Login belum berhasil",
    description: message,
    tips: [
      "Coba ulangi login sekali lagi.",
      "Jika tetap gagal, cek backend dan database admin.",
    ],
    icon: AlertTriangle,
  };
}

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() => readStoredToken());
  const [user, setUser] = useState<AdminUser | null>(() => readStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialFormState>(emptyTestimonialForm);
  const [productImageFiles, setProductImageFiles] = useState<File[]>([]);
  const [productImagePreviews, setProductImagePreviews] = useState<string[]>([]);
  const [testimonialImageFile, setTestimonialImageFile] = useState<File | null>(null);

  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardMessage, setDashboardMessage] = useState<string | null>(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isSavingTestimonial, setIsSavingTestimonial] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const categoryFormCardRef = useRef<HTMLDivElement | null>(null);
  const productFormCardRef = useRef<HTMLDivElement | null>(null);
  const testimonialFormCardRef = useRef<HTMLDivElement | null>(null);
  const categoryNameInputRef = useRef<HTMLInputElement | null>(null);
  const productNameInputRef = useRef<HTMLInputElement | null>(null);
  const productCategorySelectRef = useRef<HTMLSelectElement | null>(null);
  const testimonialNameInputRef = useRef<HTMLInputElement | null>(null);
  const loginEmailInputRef = useRef<HTMLInputElement | null>(null);
  const loginPasswordInputRef = useRef<HTMLInputElement | null>(null);
  const loginAlert = loginError ? buildLoginAlert(loginError) : null;

  function showFormError(message: string, cardRef?: React.RefObject<HTMLDivElement | null>, focusTarget?: () => void) {
    setDashboardError(message);
    setDashboardMessage(null);

    requestAnimationFrame(() => {
      cardRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      if (focusTarget) {
        requestAnimationFrame(() => {
          focusTarget();
        });
      }
    });
  }

  function validateLoginForm() {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      return {
        message: "Email admin belum diisi.",
        focus: () => loginEmailInputRef.current?.focus(),
      };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmedEmail)) {
      return {
        message: "Format email admin belum valid.",
        focus: () => loginEmailInputRef.current?.focus(),
      };
    }

    if (!password) {
      return {
        message: "Password admin belum diisi.",
        focus: () => loginPasswordInputRef.current?.focus(),
      };
    }

    if (password.length < 8) {
      return {
        message: "Password admin minimal 8 karakter.",
        focus: () => loginPasswordInputRef.current?.focus(),
      };
    }

    return null;
  }

  function validateCategoryForm() {
    if (!categoryForm.name.trim()) {
      return {
        message: "Nama kategori wajib diisi.",
        focus: () => categoryNameInputRef.current?.focus(),
      };
    }

    if (categoryForm.name.trim().length < 2) {
      return {
        message: "Nama kategori minimal 2 karakter.",
        focus: () => categoryNameInputRef.current?.focus(),
      };
    }

    return null;
  }

  function validateProductForm() {
    if (!productForm.name.trim()) {
      return {
        message: "Nama produk wajib diisi.",
        focus: () => productNameInputRef.current?.focus(),
      };
    }

    if (productForm.name.trim().length < 2) {
      return {
        message: "Nama produk minimal 2 karakter.",
        focus: () => productNameInputRef.current?.focus(),
      };
    }

    if (!productForm.categoryId) {
      return {
        message: "Kategori produk wajib dipilih.",
        focus: () => productCategorySelectRef.current?.focus(),
      };
    }

    if (!productForm.description.trim()) {
      return {
        message: "Deskripsi produk wajib diisi.",
        focus: () => productNameInputRef.current?.focus(),
      };
    }

    if (!Number.isFinite(productForm.price) || productForm.price <= 0) {
      return {
        message: "Harga produk harus lebih dari 0.",
        focus: () => productNameInputRef.current?.focus(),
      };
    }

    if (productForm.currencyCode.trim().length !== 3) {
      return {
        message: "Kode mata uang harus terdiri dari 3 huruf, misalnya IDR.",
        focus: () => productNameInputRef.current?.focus(),
      };
    }

    if (productForm.imageUrls.length === 0 && productImageFiles.length === 0) {
      return {
        message: "Produk minimal harus memiliki 1 gambar.",
        focus: () => productNameInputRef.current?.focus(),
      };
    }

    return null;
  }

  function validateTestimonialForm() {
    if (!testimonialForm.customerName.trim()) {
      return {
        message: "Nama pelanggan wajib diisi.",
        focus: () => testimonialNameInputRef.current?.focus(),
      };
    }

    if (testimonialForm.customerName.trim().length < 2) {
      return {
        message: "Nama pelanggan minimal 2 karakter.",
        focus: () => testimonialNameInputRef.current?.focus(),
      };
    }

    if (!testimonialForm.quote.trim()) {
      return {
        message: "Kutipan testimoni wajib diisi.",
        focus: () => testimonialNameInputRef.current?.focus(),
      };
    }

    if (testimonialForm.quote.trim().length < 10) {
      return {
        message: "Kutipan testimoni minimal 10 karakter.",
        focus: () => testimonialNameInputRef.current?.focus(),
      };
    }

    if (!Number.isFinite(testimonialForm.rating) || testimonialForm.rating < 1 || testimonialForm.rating > 5) {
      return {
        message: "Rating testimoni harus antara 1 sampai 5.",
        focus: () => testimonialNameInputRef.current?.focus(),
      };
    }

    return null;
  }

  useEffect(() => {
    let active = true;

    adminApi
      .bootstrapAdmin()
      .catch(() => undefined)
      .finally(() => {
        if (active) setIsBootstrapping(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function loadDashboardData(currentToken: string) {
    setDashboardError(null);

    const [categoriesData, productsData, testimonialsData] = await Promise.all([
      adminApi.getCategories(currentToken),
      adminApi.getProducts(currentToken),
      adminApi.getTestimonials(currentToken),
    ]);

    setCategories(categoriesData);
    setProducts(productsData);
    setTestimonials(testimonialsData);
  }

  useEffect(() => {
    if (!token) return;

    loadDashboardData(token).catch((error) => {
      setDashboardError(error instanceof Error ? error.message : "Failed to load dashboard");
    });
  }, [token]);

  useEffect(() => {
    if (!dashboardError && !dashboardMessage) return;

    requestAnimationFrame(() => {
      notificationRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

      requestAnimationFrame(() => {
        notificationRef.current?.focus();
      });
    });
  }, [dashboardError, dashboardMessage]);

  useEffect(() => {
    return () => {
      productImagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    };
  }, [productImagePreviews]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateLoginForm();
    if (validationError) {
      setLoginError(validationError.message);
      setSessionNotice(null);
      requestAnimationFrame(() => {
        validationError.focus();
      });
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);
    setSessionNotice(null);

    try {
      const result = await adminApi.login(email, password);
      window.localStorage.setItem(TOKEN_KEY, result.token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleLogout(message?: string) {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    setProducts([]);
    setCategories([]);
    setTestimonials([]);
    setDashboardError(null);
    setDashboardMessage(null);
    setSessionNotice(message ?? null);
  }

  useEffect(() => {
    if (!token) return;

    let timeoutId = 0;

    const logoutBecauseInactive = () => {
      handleLogout("Sesi admin berakhir otomatis karena tidak ada aktivitas selama 30 menit.");
    };

    const resetInactivityTimer = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(logoutBecauseInactive, INACTIVITY_LOGOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ["mousedown", "keydown", "mousemove", "scroll", "touchstart"];

    events.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });

    resetInactivityTimer();

    return () => {
      window.clearTimeout(timeoutId);
      events.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [token]);

  const categoryOptions = useMemo(
    () => categories.filter((category) => category.isActive !== false),
    [categories],
  );

  async function handleCategorySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const validationError = validateCategoryForm();
    if (validationError) {
      showFormError(validationError.message, categoryFormCardRef, validationError.focus);
      return;
    }

    setIsSavingCategory(true);
    setDashboardError(null);
    setDashboardMessage(null);

    const payload = {
      name: categoryForm.name,
      description: categoryForm.description || null,
      sortOrder: Number(categoryForm.sortOrder),
      isActive: categoryForm.isActive,
    };

    try {
      if (categoryForm.id) {
        await adminApi.updateCategory(categoryForm.id, payload, token);
        setDashboardMessage("Kategori berhasil diperbarui.");
      } else {
        await adminApi.createCategory(payload, token);
        setDashboardMessage("Kategori berhasil ditambahkan.");
      }

      setCategoryForm(emptyCategoryForm);
      await loadDashboardData(token);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to save category");
    } finally {
      setIsSavingCategory(false);
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const validationError = validateProductForm();
    if (validationError) {
      showFormError(validationError.message, productFormCardRef, validationError.focus);
      return;
    }

    setIsSavingProduct(true);
    setDashboardError(null);
    setDashboardMessage(null);

    try {
      const previousImageUrls = productForm.imageUrls;
      const uploadedImageUrls = productImageFiles.length > 0
        ? await Promise.all(
            productImageFiles.map(async (file) => (await adminApi.uploadImage(file, token)).imageUrl),
          )
        : [];

      const payload = buildProductPayload([...previousImageUrls, ...uploadedImageUrls]);

      if (productForm.id) {
        await adminApi.updateProduct(productForm.id, payload, token);
        setDashboardMessage("Produk berhasil diperbarui.");
      } else {
        await adminApi.createProduct(payload, token);
        setDashboardMessage("Produk berhasil ditambahkan.");
      }

      setProductForm(emptyProductForm);
      clearProductSelectedImages();
      await loadDashboardData(token);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleTestimonialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    const validationError = validateTestimonialForm();
    if (validationError) {
      showFormError(validationError.message, testimonialFormCardRef, validationError.focus);
      return;
    }

    setIsSavingTestimonial(true);
    setDashboardError(null);
    setDashboardMessage(null);

    try {
      const previousImageUrl = testimonialForm.imageUrl || null;
      const uploadedImageUrl = testimonialImageFile
        ? (await adminApi.uploadImage(testimonialImageFile, token)).imageUrl
        : previousImageUrl;

      const payload = buildTestimonialPayload(uploadedImageUrl);

      if (testimonialForm.id) {
        await adminApi.updateTestimonial(testimonialForm.id, payload, token);
        setDashboardMessage("Testimoni berhasil diperbarui.");
      } else {
        await adminApi.createTestimonial(payload, token);
        setDashboardMessage("Testimoni berhasil ditambahkan.");
      }

      if (testimonialImageFile && previousImageUrl && previousImageUrl !== uploadedImageUrl) {
        await deleteUploadedImage(previousImageUrl).catch(() => undefined);
      }

      setTestimonialForm(emptyTestimonialForm);
      setTestimonialImageFile(null);
      await loadDashboardData(token);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to save testimonial");
    } finally {
      setIsSavingTestimonial(false);
    }
  }

  async function handleDeleteCategory(id: string) {
    if (!token || !window.confirm("Hapus kategori ini?")) return;

    try {
      await adminApi.deleteCategory(id, token);
      setDashboardMessage("Kategori berhasil dihapus.");
      await loadDashboardData(token);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to delete category");
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!token || !window.confirm("Hapus produk ini?")) return;

    try {
      await adminApi.deleteProduct(id, token);
      setDashboardMessage("Produk berhasil dihapus.");
      await loadDashboardData(token);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to delete product");
    }
  }

  async function handleDeleteTestimonial(id: string) {
    if (!token || !window.confirm("Hapus testimoni ini?")) return;

    try {
      await adminApi.deleteTestimonial(id, token);
      setDashboardMessage("Testimoni berhasil dihapus.");
      await loadDashboardData(token);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to delete testimonial");
    }
  }

  function resetProductForm() {
    setProductForm(emptyProductForm);
    clearProductSelectedImages();
  }

  function startEditCategory(category: Category) {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description ?? "",
      sortOrder: category.sortOrder,
      isActive: category.isActive ?? true,
    });

    requestAnimationFrame(() => {
      categoryFormCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      requestAnimationFrame(() => {
        categoryNameInputRef.current?.focus();
        categoryNameInputRef.current?.select();
      });
    });
  }

  function resetTestimonialForm() {
    setTestimonialForm(emptyTestimonialForm);
    setTestimonialImageFile(null);
  }

  function isLocalUploadImage(imageUrl?: string | null) {
    return Boolean(imageUrl?.startsWith("/uploads/"));
  }

  async function deleteUploadedImage(imageUrl?: string | null) {
    if (!token || !imageUrl || !isLocalUploadImage(imageUrl)) {
      return;
    }

    await adminApi.deleteImage(imageUrl, token);
  }

  function clearProductSelectedImages() {
    productImagePreviews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
    setProductImageFiles([]);
    setProductImagePreviews([]);
  }

  function setSelectedProductImages(files: File[]) {
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setProductImageFiles((current) => [...current, ...files]);
    setProductImagePreviews((current) => [...current, ...previewUrls]);
  }

  function removeSelectedProductImage(index: number) {
    const removedPreview = productImagePreviews[index];
    if (removedPreview) {
      URL.revokeObjectURL(removedPreview);
    }

    setProductImageFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setProductImagePreviews((current) => current.filter((_, previewIndex) => previewIndex !== index));
  }

  function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
    const nextItems = [...items];
    const [movedItem] = nextItems.splice(fromIndex, 1);
    nextItems.splice(toIndex, 0, movedItem);
    return nextItems;
  }

  function reorderSelectedProductImages(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setProductImageFiles((current) => moveArrayItem(current, fromIndex, toIndex));
    setProductImagePreviews((current) => moveArrayItem(current, fromIndex, toIndex));
  }

  function reorderCurrentProductImages(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    setProductForm((current) => ({
      ...current,
      imageUrls: moveArrayItem(current.imageUrls, fromIndex, toIndex),
    }));
  }

  function buildProductPayload(imageUrls: string[]) {
    return {
      categoryId: productForm.categoryId || null,
      name: productForm.name,
      description: productForm.description || null,
      price: Number(productForm.price),
      currencyCode: productForm.currencyCode,
      imageUrl: imageUrls[0] ?? null,
      imageUrls,
      isPublished: productForm.isPublished,
      isBestSeller: productForm.isBestSeller,
      stockStatus: productForm.stockStatus,
      sortOrder: Number(productForm.sortOrder),
    };
  }

  function buildTestimonialPayload(imageUrl: string | null) {
    return {
      customerName: testimonialForm.customerName,
      quote: testimonialForm.quote,
      rating: Number(testimonialForm.rating),
      imageUrl,
      isPublished: testimonialForm.isPublished,
      sortOrder: Number(testimonialForm.sortOrder),
    };
  }

  async function handleRemoveProductImage(imageUrl: string) {
    const nextImageUrls = productForm.imageUrls.filter((item) => item !== imageUrl);

    if (!productForm.id) {
      await deleteUploadedImage(imageUrl).catch(() => undefined);
      setProductForm((current) => ({ ...current, imageUrls: nextImageUrls }));
      return;
    }

    if (!token) return;

    setIsSavingProduct(true);
    setDashboardError(null);
    setDashboardMessage(null);

    try {
      await adminApi.updateProduct(productForm.id, buildProductPayload(nextImageUrls), token);
      await deleteUploadedImage(imageUrl).catch(() => undefined);
      setProductForm((current) => ({ ...current, imageUrls: nextImageUrls }));
      setDashboardMessage("Gambar produk berhasil dihapus.");
      await loadDashboardData(token);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to remove product image");
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function handleRemoveTestimonialImage() {
    const currentImageUrl = testimonialForm.imageUrl || null;
    if (!currentImageUrl) return;

    if (!testimonialForm.id) {
      await deleteUploadedImage(currentImageUrl).catch(() => undefined);
      setTestimonialForm((current) => ({ ...current, imageUrl: "" }));
      setTestimonialImageFile(null);
      return;
    }

    if (!token) return;

    setIsSavingTestimonial(true);
    setDashboardError(null);
    setDashboardMessage(null);

    try {
      await adminApi.updateTestimonial(testimonialForm.id, buildTestimonialPayload(null), token);
      await deleteUploadedImage(currentImageUrl).catch(() => undefined);
      setTestimonialForm((current) => ({ ...current, imageUrl: "" }));
      setTestimonialImageFile(null);
      setDashboardMessage("Foto testimoni berhasil dihapus.");
      await loadDashboardData(token);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Failed to remove testimonial image");
    } finally {
      setIsSavingTestimonial(false);
    }
  }

  function startEditProduct(product: Product) {
    setProductForm({
      id: product.id,
      categoryId: product.categoryId ? String(product.categoryId) : "",
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      currencyCode: product.currencyCode,
      imageUrls: product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [],
      isPublished: product.isPublished,
      isBestSeller: product.isBestSeller ?? false,
      stockStatus: product.stockStatus,
      sortOrder: product.sortOrder,
    });
    clearProductSelectedImages();

    requestAnimationFrame(() => {
      productFormCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      requestAnimationFrame(() => {
        productNameInputRef.current?.focus();
        productNameInputRef.current?.select();
      });
    });
  }

  function startEditTestimonial(testimonial: Testimonial) {
    setTestimonialForm({
      id: testimonial.id,
      customerName: testimonial.customerName,
      quote: testimonial.quote,
      rating: testimonial.rating,
      imageUrl: testimonial.imageUrl ?? "",
      isPublished: testimonial.isPublished ?? true,
      sortOrder: testimonial.sortOrder,
    });
    setTestimonialImageFile(null);

    requestAnimationFrame(() => {
      testimonialFormCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      requestAnimationFrame(() => {
        testimonialNameInputRef.current?.focus();
        testimonialNameInputRef.current?.select();
      });
    });
  }

  function formatImageUrl(imageUrl?: string | null) {
    return resolveAssetUrl(imageUrl);
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f0e7dc,transparent_40%),linear-gradient(180deg,#faf9f7_0%,#f4efe8_100%)] px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
          <div className="flex-1 rounded-[2rem] bg-primary p-8 text-primary-foreground shadow-2xl">
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-primary-foreground/70">Admin CMS</p>
            <h1 className="mb-4 text-5xl leading-tight">Kelola kategori, produk, dan testimoni dari satu dashboard.</h1>
            <p className="max-w-xl text-primary-foreground/80">
              Pusat Pengelolaan Data Katalog dengan Cepat dan Mudah
            </p>
          </div>

          <Card className="w-full max-w-xl border-0 bg-white/90 shadow-2xl backdrop-blur">
            <CardHeader>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <LockKeyhole className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-3xl">Login Admin</CardTitle>
              <CardDescription>
                {isBootstrapping
                  ? "Menyiapkan admin default dari backend..."
                  : "Gunakan Email admin dan sandi Anda untuk masuk."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleLogin}>
                <Field label="Email">
                  <Input
                    ref={loginEmailInputRef}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Masukkan email"
                  />
                </Field>
                <Field label="Password">
                  <Input
                    ref={loginPasswordInputRef}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password admin"
                  />
                </Field>

                {sessionNotice ? (
                  <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {sessionNotice}
                  </div>
                ) : null}

                {loginAlert ? (
                  <div className="rounded-2xl border border-destructive/20 bg-[linear-gradient(135deg,rgba(255,241,242,0.95),rgba(255,248,248,0.96))] px-4 py-4 text-destructive shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-destructive/10">
                        <loginAlert.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-semibold">{loginAlert.title}</p>
                          <p className="mt-1 text-sm text-destructive/85">{loginAlert.description}</p>
                        </div>
                        <ul className="space-y-1 text-xs text-destructive/75">
                          {loginAlert.tips.map((tip) => (
                            <li key={tip}>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : null}

                <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isLoggingIn || isBootstrapping}>
                  {isLoggingIn ? "Masuk..." : "Masuk ke Dashboard"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 px-4 py-6 md:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-[linear-gradient(135deg,#171717_0%,#2e241f_100%)] px-6 py-8 text-primary-foreground md:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/60">Renss Furniture CMS</p>
                <h1 className="mt-3 text-4xl">Dashboard katalog furniture</h1>
                <p className="mt-3 max-w-2xl text-primary-foreground/75">
                  Dashboard Manajemen Katalog Utama untuk Mengelola Data Produk dan Informasi Katalog Secara Mudah, Modern, Terstruktur, dan Efisien.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-primary-foreground/10 bg-white/5 px-4 py-3 text-right">
                  <p className="text-sm text-primary-foreground/60">{user?.fullName}</p>
                  <p className="text-sm">{user?.email}</p>
                </div>
                <Button variant="secondary" className="rounded-xl" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard icon={<Package className="h-5 w-5" />} label="Total Produk" value={String(products.length)} />
          <SummaryCard icon={<Shapes className="h-5 w-5" />} label="Total Kategori" value={String(categories.length)} />
          <SummaryCard icon={<MessageSquareQuote className="h-5 w-5" />} label="Total Testimoni" value={String(testimonials.length)} />
        </div>

        {dashboardError || dashboardMessage ? (
          <div ref={notificationRef} tabIndex={-1} className="outline-none">
            {dashboardError ? <Message tone="error">{dashboardError}</Message> : null}
            {dashboardMessage ? <Message tone="success">{dashboardMessage}</Message> : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <TabButton active={activeTab === "products"} onClick={() => setActiveTab("products")} icon={<Package className="h-4 w-4" />}>Produk</TabButton>
          <TabButton active={activeTab === "categories"} onClick={() => setActiveTab("categories")} icon={<Shapes className="h-4 w-4" />}>Kategori</TabButton>
          <TabButton active={activeTab === "testimonials"} onClick={() => setActiveTab("testimonials")} icon={<MessageSquareQuote className="h-4 w-4" />}>Testimoni</TabButton>
          <a href="/" className="ml-auto">
            <Button variant="ghost" className="rounded-xl">Lihat Landing Page</Button>
          </a>
        </div>

        {activeTab === "products" ? (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_1.4fr]">
            <div ref={productFormCardRef}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>{productForm.id ? "Edit Produk" : "Tambah Produk"}</CardTitle>
                <CardDescription>Kelola data produk inti: kategori, deskripsi, harga, gambar, dan publikasi.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleProductSubmit}>
                  <Field label="Nama Produk">
                    <Input
                      ref={productNameInputRef}
                      value={productForm.name}
                      onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                  </Field>
                  <Field label="Kategori">
                    <select ref={productCategorySelectRef} className="flex h-10 w-full rounded-md border border-input bg-input-background px-3 text-sm outline-none" value={productForm.categoryId} onChange={(event) => setProductForm((current) => ({ ...current, categoryId: event.target.value }))}>
                      <option value="">Tanpa kategori</option>
                      {categoryOptions.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Deskripsi">
                    <Textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Harga">
                      <Input type="number" min="0" value={String(productForm.price)} onChange={(event) => setProductForm((current) => ({ ...current, price: Number(event.target.value) }))} required />
                    </Field>
                    <Field label="Mata Uang">
                      <Input value={productForm.currencyCode} onChange={(event) => setProductForm((current) => ({ ...current, currencyCode: event.target.value.toUpperCase() }))} maxLength={3} required />
                    </Field>
                  </div>
                  <MultiImageUploadField
                    label="Upload Gambar"
                    inputId="product-image-upload"
                    selectedFiles={productImageFiles}
                    selectedPreviews={productImagePreviews}
                    currentImageUrls={productForm.imageUrls}
                    currentAlt={productForm.name || "Preview produk"}
                    onFilesSelect={setSelectedProductImages}
                    onRemoveSelected={removeSelectedProductImage}
                    onReorderSelected={reorderSelectedProductImages}
                    onRemoveCurrent={handleRemoveProductImage}
                    onReorderCurrent={reorderCurrentProductImages}
                    isBusy={isSavingProduct}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Urutan">
                      <Input type="number" value={String(productForm.sortOrder)} onChange={(event) => setProductForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
                    </Field>
                    <Field label="Status Stok">
                      <select className="flex h-10 w-full rounded-md border border-input bg-input-background px-3 text-sm outline-none" value={productForm.stockStatus} onChange={(event) => setProductForm((current) => ({ ...current, stockStatus: event.target.value as ProductFormState["stockStatus"] }))}>
                        <option value="available">Available</option>
                        <option value="preorder">Preorder</option>
                        <option value="sold">Sold</option>
                      </select>
                    </Field>
                  </div>
                  <CheckboxField label="Tampilkan di website" checked={productForm.isPublished} onChange={(checked) => setProductForm((current) => ({ ...current, isPublished: checked }))} />
                  <CheckboxField label="Masukkan ke Best Sellers" checked={productForm.isBestSeller} onChange={(checked) => setProductForm((current) => ({ ...current, isBestSeller: checked }))} />
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" className="rounded-xl" disabled={isSavingProduct}>
                      {isSavingProduct ? "Menyimpan..." : productForm.id ? "Update Produk" : "Tambah Produk"}
                    </Button>
                    <Button type="button" variant="outline" className="rounded-xl" onClick={resetProductForm}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Daftar Produk</CardTitle>
                <CardDescription>Menampilkan seluruh produk dari database PostgreSQL.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {products.length === 0 ? (
                  <EmptyTableText text="Belum ada produk." />
                ) : (
                  products.map((product) => (
                    <ListRow
                      key={product.id}
                      title={product.name}
                      badges={[
                        !product.isPublished ? { label: "Draft", tone: "muted" as const } : null,
                        product.isBestSeller ? { label: "Best Seller" } : null,
                      ].filter(Boolean) as { label: string; tone?: "default" | "muted" }[]}
                      subtitle={`${product.categoryName || "Tanpa kategori"} • ${product.stockStatus}`}
                      body={
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          {(product.imageUrls?.length ?? 0) > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {product.imageUrls?.slice(0, 4).map((imageUrl, index) => (
                                <img
                                  key={`${product.id}-${index}`}
                                  src={formatImageUrl(imageUrl)}
                                  alt={`${product.name} ${index + 1}`}
                                  className="h-16 w-16 rounded-xl border object-cover"
                                />
                              ))}
                            </div>
                          ) : product.imageUrl ? (
                            <img
                              src={formatImageUrl(product.imageUrl)}
                              alt={product.name}
                              className="h-20 w-20 rounded-xl border object-cover"
                            />
                          ) : null}
                          <div className="space-y-1">
                            <p className="text-lg">{formatCurrency(product.price, product.currencyCode)}</p>
                            {product.imageUrls && product.imageUrls.length > 1 ? (
                              <p className="text-xs text-muted-foreground">{product.imageUrls.length} gambar tersimpan</p>
                            ) : null}
                            {product.description ? <p className="max-w-2xl text-sm text-muted-foreground">{product.description}</p> : null}
                          </div>
                        </div>
                      }
                      onEdit={() => startEditProduct(product)}
                      onDelete={() => handleDeleteProduct(product.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "categories" ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <div ref={categoryFormCardRef}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>{categoryForm.id ? "Edit Kategori" : "Tambah Kategori"}</CardTitle>
                <CardDescription>Kategori dipakai untuk pengelompokan produk dan navigasi katalog.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleCategorySubmit}>
                  <Field label="Nama Kategori">
                    <Input
                      ref={categoryNameInputRef}
                      value={categoryForm.name}
                      onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                  </Field>
                  <Field label="Deskripsi">
                    <Textarea value={categoryForm.description} onChange={(event) => setCategoryForm((current) => ({ ...current, description: event.target.value }))} />
                  </Field>
                  <Field label="Urutan">
                    <Input type="number" value={String(categoryForm.sortOrder)} onChange={(event) => setCategoryForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
                  </Field>
                  <CheckboxField label="Kategori aktif" checked={categoryForm.isActive} onChange={(checked) => setCategoryForm((current) => ({ ...current, isActive: checked }))} />
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" className="rounded-xl" disabled={isSavingCategory}>
                      {isSavingCategory ? "Menyimpan..." : categoryForm.id ? "Update Kategori" : "Tambah Kategori"}
                    </Button>
                    <Button type="button" variant="outline" className="rounded-xl" onClick={() => setCategoryForm(emptyCategoryForm)}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Daftar Kategori</CardTitle>
                <CardDescription>Kategori aktif akan tampil di footer landing page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.length === 0 ? (
                  <EmptyTableText text="Belum ada kategori." />
                ) : (
                  categories.map((category) => (
                    <ListRow
                      key={category.id}
                      title={category.name}
                      badges={category.isActive === false ? [{ label: "Nonaktif", tone: "muted" }] : []}
                      subtitle={`Urutan: ${category.sortOrder}`}
                      body={category.description ? <p className="max-w-xl text-sm text-muted-foreground">{category.description}</p> : null}
                      onEdit={() => startEditCategory(category)}
                      onDelete={() => handleDeleteCategory(category.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "testimonials" ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <div ref={testimonialFormCardRef}>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>{testimonialForm.id ? "Edit Testimoni" : "Tambah Testimoni"}</CardTitle>
                <CardDescription>Kelola testimoni pelanggan yang tampil di section ulasan landing page.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleTestimonialSubmit}>
                  <Field label="Nama Pelanggan">
                    <Input
                      ref={testimonialNameInputRef}
                      value={testimonialForm.customerName}
                      onChange={(event) => setTestimonialForm((current) => ({ ...current, customerName: event.target.value }))}
                      required
                    />
                  </Field>
                  <Field label="Kutipan">
                    <Textarea value={testimonialForm.quote} onChange={(event) => setTestimonialForm((current) => ({ ...current, quote: event.target.value }))} required />
                  </Field>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Rating">
                      <Input type="number" min="1" max="5" value={String(testimonialForm.rating)} onChange={(event) => setTestimonialForm((current) => ({ ...current, rating: Number(event.target.value) }))} />
                    </Field>
                    <Field label="Urutan">
                      <Input type="number" value={String(testimonialForm.sortOrder)} onChange={(event) => setTestimonialForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
                    </Field>
                  </div>
                  <ImageUploadField
                    label="Upload Foto"
                    inputId="testimonial-image-upload"
                    selectedFile={testimonialImageFile}
                    currentImageUrl={testimonialForm.imageUrl}
                    currentAlt={testimonialForm.customerName || "Preview testimoni"}
                    onFileSelect={setTestimonialImageFile}
                    onRemoveCurrent={handleRemoveTestimonialImage}
                    isBusy={isSavingTestimonial}
                  />
                  <CheckboxField label="Tampilkan di website" checked={testimonialForm.isPublished} onChange={(checked) => setTestimonialForm((current) => ({ ...current, isPublished: checked }))} />
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" className="rounded-xl" disabled={isSavingTestimonial}>
                      {isSavingTestimonial ? "Menyimpan..." : testimonialForm.id ? "Update Testimoni" : "Tambah Testimoni"}
                    </Button>
                    <Button type="button" variant="outline" className="rounded-xl" onClick={resetTestimonialForm}>Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Daftar Testimoni</CardTitle>
                <CardDescription>Data ini dipakai langsung oleh section testimonial di landing page.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {testimonials.length === 0 ? (
                  <EmptyTableText text="Belum ada testimoni." />
                ) : (
                  testimonials.map((testimonial) => (
                    <ListRow
                      key={testimonial.id}
                      title={testimonial.customerName}
                      badges={[
                        { label: `${testimonial.rating}/5` },
                        testimonial.isPublished === false ? { label: "Draft", tone: "muted" } : null,
                      ].filter(Boolean) as { label: string; tone?: "default" | "muted" }[]}
                      subtitle={`Urutan: ${testimonial.sortOrder}`}
                      body={
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                          {testimonial.imageUrl ? (
                            <img
                              src={formatImageUrl(testimonial.imageUrl)}
                              alt={testimonial.customerName}
                              className="h-20 w-20 rounded-xl border object-cover"
                            />
                          ) : null}
                          <p className="max-w-2xl text-sm text-muted-foreground">{testimonial.quote}</p>
                        </div>
                      }
                      onEdit={() => startEditTestimonial(testimonial)}
                      onDelete={() => handleDeleteTestimonial(testimonial.id)}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="flex items-center gap-4 py-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Button variant={active ? "default" : "outline"} className="rounded-xl" onClick={onClick}>
      {icon}
      {children}
    </Button>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function MultiImageUploadField({
  label,
  inputId,
  selectedFiles,
  selectedPreviews,
  currentImageUrls,
  currentAlt,
  onFilesSelect,
  onRemoveSelected,
  onReorderSelected,
  onRemoveCurrent,
  onReorderCurrent,
  isBusy,
}: {
  label: string;
  inputId: string;
  selectedFiles: File[];
  selectedPreviews: string[];
  currentImageUrls: string[];
  currentAlt: string;
  onFilesSelect: (files: File[]) => void;
  onRemoveSelected: (index: number) => void;
  onReorderSelected: (fromIndex: number, toIndex: number) => void;
  onRemoveCurrent: (imageUrl: string) => void;
  onReorderCurrent: (fromIndex: number, toIndex: number) => void;
  isBusy: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggingSelectedIndex, setDraggingSelectedIndex] = useState<number | null>(null);
  const [draggingCurrentIndex, setDraggingCurrentIndex] = useState<number | null>(null);

  function handleFileList(fileList: FileList | null) {
    onFilesSelect(fileList ? Array.from(fileList) : []);
  }

  return (
    <Field label={label}>
      <div
        className={isDragging
          ? "rounded-2xl border-2 border-dashed border-primary bg-secondary/50 p-5 text-center"
          : "rounded-2xl border-2 border-dashed border-border bg-muted/30 p-5 text-center"}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFileList(event.dataTransfer.files);
        }}
      >
        <input
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            handleFileList(event.target.files);
            event.target.value = "";
          }}
        />
        <label htmlFor={inputId} className="cursor-pointer text-sm">
          <span className="font-medium text-foreground">Klik untuk pilih beberapa gambar</span>
          <span className="block text-muted-foreground">atau drag-and-drop ke area ini. Maksimal 20 MB per file.</span>
        </label>
        {selectedFiles.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">{selectedFiles.length} file dipilih dan siap di-upload.</p>
        ) : null}
      </div>

      {selectedPreviews.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Preview gambar baru:</p>
          <div className="flex flex-wrap gap-3">
            {selectedPreviews.map((previewUrl, index) => (
              <div
                key={`${previewUrl}-${index}`}
                className="space-y-2"
                draggable
                onDragStart={() => setDraggingSelectedIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingSelectedIndex === null) return;
                  onReorderSelected(draggingSelectedIndex, index);
                  setDraggingSelectedIndex(null);
                }}
                onDragEnd={() => setDraggingSelectedIndex(null)}
              >
                <img src={previewUrl} alt={`${currentAlt} baru ${index + 1}`} className="h-24 w-24 rounded-xl border object-cover" />
                <p className="text-center text-[11px] text-muted-foreground">Drag untuk ubah urutan</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg"
                  onClick={() => onRemoveSelected(index)}
                  disabled={isBusy}
                >
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {currentImageUrls.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Gambar produk saat ini:</p>
          <div className="flex flex-wrap gap-3">
            {currentImageUrls.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="space-y-2"
                draggable
                onDragStart={() => setDraggingCurrentIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => {
                  if (draggingCurrentIndex === null) return;
                  onReorderCurrent(draggingCurrentIndex, index);
                  setDraggingCurrentIndex(null);
                }}
                onDragEnd={() => setDraggingCurrentIndex(null)}
              >
                <img src={imageUrl} alt={`${currentAlt} ${index + 1}`} className="h-24 w-24 rounded-xl border object-cover" />
                <p className="text-center text-[11px] text-muted-foreground">Drag untuk ubah urutan</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full rounded-lg"
                  onClick={() => onRemoveCurrent(imageUrl)}
                  disabled={isBusy}
                >
                  Hapus lama
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Field>
  );
}

function ImageUploadField({
  label,
  inputId,
  selectedFile,
  currentImageUrl,
  currentAlt,
  onFileSelect,
  onRemoveCurrent,
  isBusy,
}: {
  label: string;
  inputId: string;
  selectedFile: File | null;
  currentImageUrl?: string;
  currentAlt: string;
  onFileSelect: (file: File | null) => void;
  onRemoveCurrent: () => void;
  isBusy: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedPreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setSelectedPreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedFile]);

  function handleFileList(fileList: FileList | null) {
    onFileSelect(fileList?.[0] ?? null);
  }

  return (
    <Field label={label}>
      <div
        className={isDragging
          ? "rounded-2xl border-2 border-dashed border-primary bg-secondary/50 p-5 text-center"
          : "rounded-2xl border-2 border-dashed border-border bg-muted/30 p-5 text-center"}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFileList(event.dataTransfer.files);
        }}
      >
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFileList(event.target.files)}
        />
        <label htmlFor={inputId} className="cursor-pointer text-sm">
          <span className="font-medium text-foreground">Klik untuk pilih gambar</span>
          <span className="block text-muted-foreground">atau drag-and-drop ke area ini. Maksimal 20 MB.</span>
        </label>
        {selectedFile ? <p className="mt-3 text-xs text-muted-foreground">File dipilih: {selectedFile.name}</p> : null}
      </div>

      {selectedPreviewUrl ? (
        <div className="space-y-2 rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Preview gambar baru:</p>
          <img src={selectedPreviewUrl} alt={`${currentAlt} baru`} className="h-24 w-24 rounded-xl border object-cover" />
        </div>
      ) : null}

      {currentImageUrl ? (
        <div className="space-y-2 rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground">Gambar saat ini:</p>
          <img src={currentImageUrl} alt={currentAlt} className="h-24 w-24 rounded-xl border object-cover" />
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={onRemoveCurrent}
            disabled={isBusy}
          >
            Hapus gambar lama
          </Button>
        </div>
      ) : null}
    </Field>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}

function StatusPill({ label, tone = "default" }: { label: string; tone?: "default" | "muted" }) {
  return (
    <span className={tone === "default" ? "rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground" : "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"}>
      {label}
    </span>
  );
}

function ListRow({
  title,
  badges,
  subtitle,
  body,
  onEdit,
  onDelete,
}: {
  title: string;
  badges: { label: string; tone?: "default" | "muted" }[];
  subtitle: string;
  body: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-medium">{title}</h3>
            {badges.map((badge) => (
              <StatusPill key={`${title}-${badge.label}`} label={badge.label} tone={badge.tone} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          {body}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" className="rounded-xl" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Hapus
          </Button>
        </div>
      </div>
    </div>
  );
}

function EmptyTableText({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-muted-foreground">
      {text}
    </div>
  );
}

function Message({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  return (
    <div className={tone === "error" ? "rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive" : "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"}>
      {children}
    </div>
  );
}
