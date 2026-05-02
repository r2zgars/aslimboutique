import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const ADMIN = {
  email: "admin@aslimboutique.com",
  password: "Aslim2026!",
};

const DEFAULT_STORE = {
  logo: "",
  brandName: "ASLIM BOUTIQUE",
  slogan: "LUXURY CURATED STORE",
  email: "hello@aslimboutique.com",
  phone: "+90 555 555 55 55",
  location: "Nişantaşı / İstanbul",
  instagram: "https://instagram.com/",
  whatsapp: "https://wa.me/905555555555",
  homeTitle1: "Soft.",
  homeTitle2: "Elegant.",
  homeTitle3: "Exclusive.",
  homeDescription:
    "Seçkin koleksiyonları keşfet, ürün detaylarını incele ve satın alma linkine zarif bir akışla direkt geç.",
  featuredTitle: "Seçili Ürünler",
  collectionTitle: "Özenle Seçilmiş Koleksiyon",
  contactTitle: "Özel İletişim",
  homeHeroImage:
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=80",
};

const DEFAULT_CATEGORIES = ["Elbise", "Takım", "Ceket", "Aksesuar", "Ayakkabı", "Çanta", "Takı", "Diğer"];

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function currency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function normalizeProduct(raw, fallbackId = null) {
  const images = Array.isArray(raw?.images)
    ? raw.images.filter(Boolean)
    : raw?.image
      ? [raw.image]
      : [];

  return {
    id: raw?.id ?? fallbackId ?? null,
    name: raw?.name ?? "",
    category: raw?.category ?? "Diğer",
    price: Number(raw?.price ?? 0),
    compareAtPrice: Number(raw?.compareAtPrice ?? 0),
    images,
    badge: raw?.badge ?? "NEW",
    description: raw?.description ?? "",
    buyLink: raw?.buyLink ?? "",
    featured: Boolean(raw?.featured),
  };
}

function getEmptyProductForm(defaultCategory = "Elbise") {
  return {
    id: null,
    name: "",
    category: defaultCategory,
    price: "",
    compareAtPrice: "",
    images: [],
    badge: "NEW",
    description: "",
    buyLink: "",
    featured: false,
  };
}

async function fileToDataUrl(file, maxSide = 1400, quality = 0.82) {
  if (!file) return "";
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(raw);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(raw);
      img.src = raw;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function openExternalLink(url) {
  if (!url) return;
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.assign(url);
  } catch {
    window.location.assign(url);
  }
}

function IconBase({ children, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const HomeIcon = (props) => (
  <IconBase {...props}>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5 10.5V20h14v-9.5" />
    <path d="M10 20v-5h4v5" />
  </IconBase>
);
const StoreIcon = (props) => (
  <IconBase {...props}>
    <path d="M4 8h16l-1 4H5L4 8Z" />
    <path d="M6 12v8h12v-8" />
    <path d="M9 16h6" />
  </IconBase>
);
const SendIcon = (props) => (
  <IconBase {...props}>
    <path d="M22 2 11 13" />
    <path d="m22 2-7 20-4-9-9-4 20-7Z" />
  </IconBase>
);
const UserIcon = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c1.7-3.4 4.3-5 8-5s6.3 1.6 8 5" />
  </IconBase>
);
const MenuIcon = (props) => (
  <IconBase {...props}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </IconBase>
);
const SearchIcon = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="6" />
    <path d="m20 20-4.2-4.2" />
  </IconBase>
);
const ArrowRightIcon = (props) => (
  <IconBase {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </IconBase>
);
const LogoutIcon = (props) => (
  <IconBase {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </IconBase>
);

const InstagramIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

const WhatsAppIcon = ({ className = "h-4 w-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.33-1.66a11.9 11.9 0 0 0 5.74 1.46h.01c6.57 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.17-3.46-8.42ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.76.99 1-3.67-.23-.38a9.87 9.87 0 0 1-1.5-5.25C2.17 6.44 6.62 2 12.07 2c2.64 0 5.12 1.03 6.98 2.89a9.82 9.82 0 0 1 2.88 6.99c0 5.45-4.44 9.9-9.85 9.9Zm5.43-7.42c-.3-.15-1.77-.87-2.04-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.08-.3-.15-1.26-.46-2.41-1.47-.89-.79-1.5-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.66-1.6-.91-2.19-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.5.08-.76.38-.26.3-1 1-.99 2.43 0 1.43 1.03 2.81 1.18 3 .15.2 2.03 3.1 4.92 4.35.69.3 1.23.48 1.65.62.69.22 1.32.19 1.81.12.55-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
  </svg>
);

function GlassCard({ className = "", children }) {
  return (
    <div className={cx("rounded-[30px] border border-white/60 bg-white/36 shadow-[0_10px_34px_rgba(255,255,255,0.18),0_12px_28px_rgba(0,0,0,0.05)] backdrop-blur-[28px]", className)}>
      {children}
    </div>
  );
}
function PrimaryButton({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={cx("rounded-full border border-white/55 bg-white/28 px-5 py-3 text-sm font-medium text-black shadow-[0_8px_24px_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.05)] backdrop-blur-[26px] transition duration-300 hover:-translate-y-[1px] hover:bg-white/38 active:scale-[0.98]", className)}
    />
  );
}
function SecondaryButton({ className = "", ...props }) {
  return (
    <button
      {...props}
      className={cx("rounded-full border border-white/50 bg-white/18 px-5 py-3 text-sm font-medium text-black shadow-[0_8px_22px_rgba(255,255,255,0.12),0_8px_20px_rgba(0,0,0,0.04)] backdrop-blur-[26px] transition duration-300 hover:-translate-y-[1px] hover:bg-white/28 active:scale-[0.98]", className)}
    />
  );
}
function Input(props) {
  return <input {...props} className={cx("w-full rounded-2xl border border-white/55 bg-white/28 px-4 py-3 outline-none shadow-[0_6px_18px_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.04)] backdrop-blur-[24px] transition focus:border-white/70 focus:bg-white/38", props.className)} />;
}
function TextArea(props) {
  return <textarea {...props} className={cx("w-full rounded-2xl border border-white/55 bg-white/28 px-4 py-3 outline-none shadow-[0_6px_18px_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.04)] backdrop-blur-[24px] transition focus:border-white/70 focus:bg-white/38", props.className)} />;
}
function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-black/60">{label}</div>
      {children}
    </label>
  );
}
function ProductCard({ product, onOpen, compact = false }) {
  const image = product.images?.[0] || DEFAULT_STORE.homeHeroImage;
  return (
    <button type="button" onClick={() => onOpen(product)} className="overflow-hidden rounded-[24px] border border-black/10 bg-white/70 text-left transition duration-300 hover:-translate-y-1">
      <div className={cx(compact ? "h-48" : "h-64", "w-full overflow-hidden")}>
        <img src={image} alt={product.name} className="h-full w-full object-cover transition duration-700 hover:scale-[1.04]" />
      </div>
      <div className="p-4">
        <div className="text-[11px] uppercase tracking-[0.3em] text-black/40">{product.category}</div>
        <div className="mt-2 text-base font-semibold sm:text-lg">{product.name}</div>
        <div className="mt-2 line-clamp-2 text-sm text-black/55">{product.description}</div>
        <div className="mt-4 font-semibold">{currency(product.price)}</div>
      </div>
    </button>
  );
}
function QuickAccessBar({ setPage }) {
  const items = [
    { label: "Seçkin Koleksiyon", kicker: "Premium", page: "shop" },
    { label: "Özel Parçalar", kicker: "Butik", page: "contact" },
  ];

  return (
    <div className="mx-auto w-full max-w-[520px] md:max-w-none">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setPage(item.page)}
            className={cx(
              "rounded-[26px] border border-white/60 bg-white/28 p-4 text-left shadow-[0_10px_28px_rgba(255,255,255,0.18),0_12px_24px_rgba(0,0,0,0.04)] backdrop-blur-[28px] transition duration-300 hover:-translate-y-[2px] hover:bg-white/40",
              index === 0 ? "md:col-span-1" : "md:col-span-1"
            )}
          >
            <div className="text-[10px] uppercase tracking-[0.32em] text-black/40">{item.kicker}</div>
            <div className="mt-3 text-lg font-semibold text-black leading-tight">{item.label}</div>
          </button>
        ))}
        <div className="hidden md:block rounded-[26px] border border-white/60 bg-white/28 p-4 shadow-[0_10px_28px_rgba(255,255,255,0.18),0_12px_24px_rgba(0,0,0,0.04)] backdrop-blur-[28px]">
          <div className="text-[10px] uppercase tracking-[0.32em] text-black/40">Hızlı Erişim</div>
          <div className="mt-3 text-lg font-semibold text-black">Anasayfa</div>
        </div>
      </div>
    </div>
  );
}

function MobileBottomNav({ page, setPage, isAdmin, currentUser, openAuth }) {
  const items = [
    { key: "home", label: "Anasayfa", Icon: HomeIcon },
    { key: "shop", label: "Koleksiyon", Icon: StoreIcon },
    { key: "contact", label: "İletişim", Icon: SendIcon },
    { key: isAdmin ? "admin" : currentUser ? "home" : "auth", label: isAdmin ? "Panel" : currentUser ? "Hesap" : "Giriş", Icon: UserIcon },
  ];
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/50 bg-white/38 px-3 py-2 backdrop-blur-[30px] md:hidden">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = item.Icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                if (item.key === "auth") {
                  openAuth("login");
                  return;
                }
                setPage(item.key);
              }}
              className={cx("flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium shadow-[0_8px_22px_rgba(255,255,255,0.15),0_6px_14px_rgba(0,0,0,0.04)] backdrop-blur-[26px] transition duration-300", active ? "border border-white/70 bg-white/42 text-black" : "border border-white/45 bg-white/20 text-black/80")}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [hydrated, setHydrated] = useState(false);
  const [bootError, setBootError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [storeData, setStoreData] = useState(DEFAULT_STORE);
  const [storeDraft, setStoreDraft] = useState(DEFAULT_STORE);
  const [activeProduct, setActiveProduct] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [productForm, setProductForm] = useState(getEmptyProductForm());
  const [productError, setProductError] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [storeMessage, setStoreMessage] = useState("");
  const isAdmin = currentUser?.role === "admin";

  const featuredProducts = useMemo(() => products.filter((p) => p.featured).slice(0, 4), [products]);
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const okCategory = selectedCategory === "Tümü" || product.category === selectedCategory;
      const okSearch = !q || product.name.toLowerCase().includes(q) || product.description.toLowerCase().includes(q) || product.category.toLowerCase().includes(q);
      return okCategory && okSearch;
    });
  }, [products, search, selectedCategory]);

  async function loadRemoteData() {
    setBootError("");
    const [productsRes, categoriesRes, storeRes] = await Promise.all([
      supabase.from("products").select("*").order("id", { ascending: false }),
      supabase.from("categories").select("*").order("id", { ascending: true }),
      supabase.from("store_settings").select("*").order("id", { ascending: false }).limit(1),
    ]);

    if (productsRes.error) setBootError(productsRes.error.message);
    if (categoriesRes.error) setBootError((prev) => prev || categoriesRes.error.message);
    if (storeRes.error) setBootError((prev) => prev || storeRes.error.message);

    if (productsRes.data) {
      setProducts(productsRes.data.map((p, i) => normalizeProduct({
        id: p.id, name: p.name, category: p.category, price: p.price,
        compareAtPrice: p.compare_at_price, images: Array.isArray(p.images) ? p.images : [],
        badge: p.badge, description: p.description, buyLink: p.buy_link, featured: p.featured,
      }, i + 1)));
    }
    if (categoriesRes.data && categoriesRes.data.length > 0) setCategories(categoriesRes.data.map((c) => c.name));
    if (storeRes.data && storeRes.data.length > 0) {
      const s = storeRes.data[0];
      const nextStore = {
        logo: s.logo || DEFAULT_STORE.logo,
        brandName: s.brand_name || DEFAULT_STORE.brandName,
        slogan: s.slogan || DEFAULT_STORE.slogan,
        email: s.email || DEFAULT_STORE.email,
        phone: s.phone || DEFAULT_STORE.phone,
        location: s.location || DEFAULT_STORE.location,
        instagram: s.instagram || DEFAULT_STORE.instagram,
        whatsapp: s.whatsapp || DEFAULT_STORE.whatsapp,
        homeTitle1: s.home_title1 || DEFAULT_STORE.homeTitle1,
        homeTitle2: s.home_title2 || DEFAULT_STORE.homeTitle2,
        homeTitle3: s.home_title3 || DEFAULT_STORE.homeTitle3,
        homeDescription: s.home_description || DEFAULT_STORE.homeDescription,
        featuredTitle: s.featured_title || DEFAULT_STORE.featuredTitle,
        collectionTitle: s.collection_title || DEFAULT_STORE.collectionTitle,
        contactTitle: s.contact_title || DEFAULT_STORE.contactTitle,
        homeHeroImage: s.home_hero_image || DEFAULT_STORE.homeHeroImage,
      };
      setStoreData(nextStore);
      setStoreDraft(nextStore);
    }
    setHydrated(true);
  }

  useEffect(() => { loadRemoteData(); }, []);
  useEffect(() => {
    if (!categories.includes(productForm.category)) {
      setProductForm((prev) => ({ ...prev, category: categories[0] || "Diğer" }));
    }
  }, [categories, productForm.category]);

  async function saveProductToSupabase(payload) {
    const row = {
      name: payload.name,
      category: payload.category,
      price: Number(payload.price || 0),
      compare_at_price: Number(payload.compareAtPrice || 0),
      images: Array.isArray(payload.images) ? payload.images : [],
      badge: payload.badge || "NEW",
      description: payload.description || "",
      buy_link: payload.buyLink || "",
      featured: !!payload.featured,
    };
    const result = payload.id
      ? await supabase.from("products").update(row).eq("id", payload.id).select()
      : await supabase.from("products").insert(row).select();
    if (result.error) throw new Error(result.error.message);
    await loadRemoteData();
  }

  async function deleteProductFromSupabase(id) {
    const result = await supabase.from("products").delete().eq("id", id);
    if (result.error) throw new Error(result.error.message);
    await loadRemoteData();
  }

  async function addCategoryToSupabase(name) {
    const result = await supabase.from("categories").insert({ name });
    if (result.error) throw new Error(result.error.message);
    await loadRemoteData();
  }

  async function deleteCategoryFromSupabase(name) {
    const result = await supabase.from("categories").delete().eq("name", name);
    if (result.error) throw new Error(result.error.message);
    await loadRemoteData();
  }

  async function saveStoreSettingsToSupabase(data) {
    const payload = {
      brand_name: data.brandName,
      slogan: data.slogan,
      email: data.email,
      phone: data.phone,
      location: data.location,
      instagram: data.instagram,
      whatsapp: data.whatsapp,
      home_title1: data.homeTitle1,
      home_title2: data.homeTitle2,
      home_title3: data.homeTitle3,
      home_description: data.homeDescription,
      featured_title: data.featuredTitle,
      collection_title: data.collectionTitle,
      contact_title: data.contactTitle,
      home_hero_image: data.homeHeroImage,
      logo: data.logo,
      updated_at: new Date().toISOString(),
    };
    const rowsResult = await supabase.from("store_settings").select("id").limit(1);
    if (rowsResult.error) throw new Error(rowsResult.error.message);
    const result = rowsResult.data && rowsResult.data.length > 0
      ? await supabase.from("store_settings").update(payload).eq("id", rowsResult.data[0].id)
      : await supabase.from("store_settings").insert(payload);
    if (result.error) throw new Error(result.error.message);
    await loadRemoteData();
  }

  function validateProductForm() {
    if (!productForm.name.trim()) return "Ürün adı zorunlu.";
    if (!productForm.price || Number(productForm.price) <= 0) return "Geçerli bir fiyat gir.";
    if (!productForm.images.length) return "En az 1 ürün görseli seç.";
    if (!productForm.buyLink.trim().startsWith("http")) return "Geçerli bir satın al linki gir.";
    if (!productForm.description.trim()) return "Kısa açıklama gir.";
    return "";
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    setProductError(""); setProductMessage("");
    const formError = validateProductForm();
    if (formError) return setProductError(formError);
    const payload = {
      id: productForm.id || null,
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      compareAtPrice: Number(productForm.compareAtPrice || 0),
      images: Array.isArray(productForm.images) ? productForm.images : [],
      badge: productForm.badge.trim() || "NEW",
      description: productForm.description.trim(),
      buyLink: productForm.buyLink.trim(),
      featured: Boolean(productForm.featured),
    };
    try {
      await saveProductToSupabase(payload);
      setProductMessage(productForm.id ? "Ürün güncellendi." : "Ürün listelendi.");
      setProductForm(getEmptyProductForm(categories[0] || "Diğer"));
    } catch (err) {
      setProductError(err.message || "Ürün kaydedilemedi.");
    }
  }

  async function handleDeleteProduct(id) {
    setProductError(""); setProductMessage("");
    try {
      await deleteProductFromSupabase(id);
      setProductMessage("Ürün silindi.");
      if (activeProduct?.id === id) { setActiveProduct(null); setPage("shop"); }
    } catch (err) {
      setProductError(err.message || "Ürün silinemedi.");
    }
  }

  function handleEditProduct(product) {
    setPage("admin");
    setProductForm({
      id: product.id, name: product.name, category: product.category,
      price: String(product.price), compareAtPrice: String(product.compareAtPrice || ""),
      images: product.images || [], badge: product.badge || "NEW",
      description: product.description || "", buyLink: product.buyLink || "",
      featured: Boolean(product.featured),
    });
  }

  async function handleProductImagesChange(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const converted = await Promise.all(files.map((file) => fileToDataUrl(file, 1400, 0.82)));
    setProductForm((prev) => ({ ...prev, images: [...prev.images, ...converted.filter(Boolean)] }));
    e.target.value = "";
  }

  function removeProductImage(index) {
    setProductForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  }

  async function handleAddCategory() {
    const value = categoryInput.trim();
    if (!value) return;
    if (categories.some((c) => c.toLowerCase() === value.toLowerCase())) return setCategoryMessage("Bu kategori zaten var.");
    try {
      await addCategoryToSupabase(value);
      setCategoryInput(""); setCategoryMessage("Kategori eklendi.");
    } catch (err) {
      setCategoryMessage(err.message || "Kategori eklenemedi.");
    }
  }

  async function handleDeleteCategory(name) {
    try {
      await deleteCategoryFromSupabase(name);
      setCategoryMessage("Kategori silindi.");
      if (selectedCategory === name) setSelectedCategory("Tümü");
    } catch (err) {
      setCategoryMessage(err.message || "Kategori silinemedi.");
    }
  }

  async function handleStoreSave() {
    try {
      await saveStoreSettingsToSupabase(storeDraft);
      setStoreMessage("Kaydedildi.");
    } catch (err) {
      setStoreMessage(err.message || "Kaydedilemedi.");
    }
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const image = await fileToDataUrl(file, 600, 0.9);
    setStoreDraft((prev) => ({ ...prev, logo: image }));
    e.target.value = "";
  }

  async function handleHeroChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const image = await fileToDataUrl(file, 1800, 0.82);
    setStoreDraft((prev) => ({ ...prev, homeHeroImage: image }));
    e.target.value = "";
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setPage("auth");
    setMobileMenuOpen(false);
  }

  function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password;
    if (!email || !password) return setAuthError("E-posta ve şifre zorunlu.");

    if (authMode === "login") {
      if (email === ADMIN.email && password === ADMIN.password) {
        setCurrentUser({ name: "Admin", email, role: "admin" });
        setPage("admin");
        return;
      }
      const user = users.find((u) => u.email.toLowerCase() === email && u.password === password);
      if (!user) return setAuthError("E-posta veya şifre hatalı.");
      setCurrentUser({ name: user.name, email: user.email, role: "user" });
      setPage("home");
      return;
    }

    if (!authForm.name.trim()) return setAuthError("Ad soyad zorunlu.");
    if (password.length < 6) return setAuthError("Şifre en az 6 karakter olmalı.");
    if (password !== authForm.confirmPassword) return setAuthError("Şifreler eşleşmiyor.");

    const newUser = { id: Date.now(), name: authForm.name.trim(), email, password, role: "user" };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser({ name: newUser.name, email: newUser.email, role: "user" });
    setPage("home");
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#f3efe9] px-6 py-16 text-black">
        <div className="mx-auto max-w-3xl rounded-[30px] border border-black/10 bg-white/70 p-8">
          <div className="text-lg font-semibold">Yükleniyor...</div>
          {bootError ? <div className="mt-3 text-sm text-red-500">{bootError}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3efe9] pb-24 text-black md:pb-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.95),transparent_28%),radial-gradient(circle_at_right,rgba(255,255,255,0.35),transparent_24%)]" />

      <header className="sticky top-0 z-20 border-b border-white/45 bg-white/38 backdrop-blur-[28px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <button onClick={() => setPage("home")} className="flex items-center gap-3 text-left">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-black/10 bg-white">
              {storeData.logo ? <img src={storeData.logo} alt="logo" className="h-full w-full object-cover" /> : <span className="text-[10px] text-black/45">LOGO</span>}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[10px] uppercase tracking-[0.35em] text-black/35">r2 development</div>
              <div className="truncate text-lg font-semibold">{storeData.brandName}</div>
            </div>
          </button>

          <nav className="hidden items-center gap-2 md:flex">
            <SecondaryButton onClick={() => setPage("home")}>Anasayfa</SecondaryButton>
            <SecondaryButton onClick={() => setPage("shop")}>Koleksiyon</SecondaryButton>
            <SecondaryButton onClick={() => setPage("contact")}>İletişim</SecondaryButton>
            {isAdmin ? <PrimaryButton onClick={() => setPage("admin")}>Yönetici Paneli</PrimaryButton> : null}
          </nav>

          <div className="hidden gap-2 md:flex">
            {!currentUser ? (
              <>
                <SecondaryButton onClick={() => openAuth("login")}>Giriş Yap</SecondaryButton>
                <PrimaryButton onClick={() => openAuth("register")}>Kayıt Ol</PrimaryButton>
              </>
            ) : (
              <SecondaryButton onClick={() => { setCurrentUser(null); setPage("home"); }}>
                <LogoutIcon className="mr-1 inline h-4 w-4" /> Çıkış
              </SecondaryButton>
            )}
          </div>

          <button type="button" onClick={() => setMobileMenuOpen((prev) => !prev)} className="rounded-full border border-white/50 bg-white/20 px-3 py-2 shadow-[0_8px_22px_rgba(255,255,255,0.14),0_6px_14px_rgba(0,0,0,0.04)] backdrop-blur-[24px] md:hidden">
            <MenuIcon className="h-5 w-5" />
          </button>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/45 px-4 pb-4 pt-2 md:hidden">
            <div className="grid gap-2">
              <SecondaryButton onClick={() => { setPage("home"); setMobileMenuOpen(false); }}>Anasayfa</SecondaryButton>
              <SecondaryButton onClick={() => { setPage("shop"); setMobileMenuOpen(false); }}>Koleksiyon</SecondaryButton>
              <SecondaryButton onClick={() => { setPage("contact"); setMobileMenuOpen(false); }}>İletişim</SecondaryButton>
              {!currentUser ? (
                <>
                  <SecondaryButton onClick={() => openAuth("login")}>Giriş Yap</SecondaryButton>
                  <PrimaryButton onClick={() => openAuth("register")}>Kayıt Ol</PrimaryButton>
                </>
              ) : isAdmin ? (
                <PrimaryButton onClick={() => { setPage("admin"); setMobileMenuOpen(false); }}>Yönetici Paneli</PrimaryButton>
              ) : null}
            </div>
          </div>
        ) : null}
      </header>

      {page === "home" && (
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="order-2 p-6 text-center sm:p-8 lg:order-1 lg:text-left">
              <div className="animate-[fadeIn_.6s_ease] text-[11px] uppercase tracking-[0.4em] text-black/40">{storeData.slogan}</div>
              <h1 className="mt-4 animate-[fadeIn_.8s_ease] text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                {storeData.homeTitle1}<br />{storeData.homeTitle2}<br />{storeData.homeTitle3}
              </h1>
              <p className="mt-4 animate-[fadeIn_1s_ease] text-sm leading-7 text-black/60 sm:text-base lg:max-w-xl">{storeData.homeDescription}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 sm:mx-auto sm:max-w-[360px] lg:mx-0 lg:max-w-none lg:flex lg:flex-wrap">
                <button onClick={() => setPage("shop")} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/55 bg-white/30 px-6 py-3 text-sm font-medium text-black shadow-[0_8px_24px_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.05)] backdrop-blur-[26px] transition duration-300 hover:-translate-y-[1px] hover:bg-white/40 active:scale-[0.98]">Koleksiyona Geç <ArrowRightIcon className="h-4 w-4" /></button>
                <SecondaryButton onClick={() => setPage("contact")}>İletişim</SecondaryButton>
              </div>
            </GlassCard>

            <GlassCard className="order-1 overflow-hidden lg:order-2">
              <img src={storeData.homeHeroImage} alt="hero" className="h-[260px] w-full object-cover object-center sm:h-[320px] lg:h-full lg:min-h-[520px]" />
            </GlassCard>
          </div>

          <section className="mt-6"><QuickAccessBar setPage={setPage} /></section>

          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4 text-center sm:text-left">
              <div className="flex-1 sm:flex-none">
                <div className="text-[11px] uppercase tracking-[0.34em] text-black/38">Signature Selection</div>
                <div className="mt-2 text-2xl font-semibold">{storeData.featuredTitle}</div>
              </div>
              <SecondaryButton className="hidden sm:inline-flex" onClick={() => setPage("shop")}>Hepsi</SecondaryButton>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} compact onOpen={(item) => { setActiveProduct(item); setPage("product"); }} />
              ))}
            </div>
          </section>
        </main>
      )}

      {page === "shop" && (
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
            <GlassCard className="order-1 p-4 xl:hidden">
              <div className="grid gap-3">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ürün ara"
                    className="pl-11 text-center placeholder:text-black/35"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full rounded-full border border-white/55 bg-white/28 px-4 py-3 text-center text-sm shadow-[0_6px_18px_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.04)] backdrop-blur-[24px]"
                  >
                    <option value="Tümü">Öne çıkanlar</option>
                    <option value="Tümü">Tümü</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => setMobileCategoryOpen((prev) => !prev)}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/55 bg-white/28 px-4 py-3 text-sm shadow-[0_6px_18px_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.04)] backdrop-blur-[24px] transition hover:bg-white/38"
                  >
                    <MenuIcon className="h-4 w-4" />
                    Kategoriler
                  </button>
                </div>

                {mobileCategoryOpen ? (
                  <div className="flex flex-wrap justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("Tümü")}
                      className={cx(
                        "rounded-full border px-4 py-2 text-sm backdrop-blur-[24px] transition",
                        selectedCategory === "Tümü" ? "border-white/70 bg-white/42" : "border-white/45 bg-white/18"
                      )}
                    >
                      Tümü
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCategory(c)}
                        className={cx(
                          "rounded-full border px-4 py-2 text-sm backdrop-blur-[24px] transition",
                          selectedCategory === c ? "border-white/70 bg-white/42" : "border-white/45 bg-white/18"
                        )}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </GlassCard>

            <GlassCard className="order-2 hidden p-4 xl:order-1 xl:sticky xl:top-28 xl:block xl:h-fit">
              <div className="text-[11px] uppercase tracking-[0.32em] text-black/40">Hızlı Erişim</div>
              <div className="mt-4 grid gap-2">
                <SecondaryButton onClick={() => setPage("home")}>Anasayfa</SecondaryButton>
                <SecondaryButton onClick={() => setPage("contact")}>İletişim</SecondaryButton>
                {isAdmin ? <PrimaryButton onClick={() => setPage("admin")}>Yönetici Paneli</PrimaryButton> : null}
              </div>
              <div className="mt-6 text-[11px] uppercase tracking-[0.32em] text-black/40">Kategoriler</div>
              <div className="mt-3 flex flex-wrap gap-2 xl:grid xl:grid-cols-1">
                <button type="button" onClick={() => setSelectedCategory("Tümü")} className={cx("rounded-full border px-4 py-2 text-sm backdrop-blur-[24px] transition", selectedCategory === "Tümü" ? "border-white/70 bg-white/42" : "border-white/45 bg-white/18")}>Tümü</button>
                {categories.map((c) => (
                  <button key={c} type="button" onClick={() => setSelectedCategory(c)} className={cx("rounded-full border px-4 py-2 text-sm backdrop-blur-[24px] transition", selectedCategory === c ? "border-white/70 bg-white/42" : "border-white/45 bg-white/18")}>{c}</button>
                ))}
              </div>
            </GlassCard>

            <div className="order-3 xl:order-2">
              <GlassCard className="mb-6 hidden p-4 xl:block">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="relative">
                    <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün ara" className="pl-11" />
                  </div>
                  <SecondaryButton onClick={() => setPage("home")}>Anasayfa</SecondaryButton>
                </div>
              </GlassCard>
              {mobileCategoryOpen ? (
                <div className="mb-4 hidden flex-wrap justify-center gap-2 xl:flex">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("Tümü")}
                    className={cx(
                      "rounded-full border px-4 py-2 text-sm backdrop-blur-[24px] transition",
                      selectedCategory === "Tümü" ? "border-white/70 bg-white/42" : "border-white/45 bg-white/18"
                    )}
                  >
                    Tümü
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCategory(c)}
                      className={cx(
                        "rounded-full border px-4 py-2 text-sm backdrop-blur-[24px] transition",
                        selectedCategory === c ? "border-white/70 bg-white/42" : "border-white/45 bg-white/18"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onOpen={(item) => { setActiveProduct(item); setPage("product"); }} />
                ))}
              </div>
            </div>
          </div>
        </main>
      )}

      {page === "product" && activeProduct && (
        <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1.05fr_.95fr]">
          <GlassCard className="order-1 p-4">
            <img src={activeProduct.images?.[0] || DEFAULT_STORE.homeHeroImage} alt={activeProduct.name} className="h-[380px] w-full rounded-[24px] object-cover sm:h-[520px] lg:h-[700px]" />
          </GlassCard>

          <GlassCard className="order-2 p-6 sm:p-8 lg:sticky lg:top-28 lg:h-fit">
            <SecondaryButton className="mb-6" onClick={() => setPage("shop")}>← Koleksiyona dön</SecondaryButton>
            <div className="text-[11px] uppercase tracking-[0.3em] text-black/40">{activeProduct.category}</div>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{activeProduct.name}</h2>
            <div className="mt-4 text-2xl font-semibold">{currency(activeProduct.price)}</div>
            <p className="mt-6 text-sm leading-7 text-black/60 sm:text-base">{activeProduct.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryButton onClick={() => openExternalLink(activeProduct.buyLink)}>Satın Al</PrimaryButton>
              <SecondaryButton onClick={() => setPage("contact")}>İletişime Geç</SecondaryButton>
            </div>
          </GlassCard>
        </main>
      )}

      {page === "contact" && (
        <main className="mx-auto max-w-7xl px-4 py-6">
          <div className="mb-6"><QuickAccessBar setPage={setPage} /></div>
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="p-8">
              <div className="text-3xl font-semibold">{storeData.contactTitle}</div>
              <div className="mt-6 space-y-3 text-black/70">
                <div>{storeData.email}</div>
                <div>{storeData.phone}</div>
                <div>{storeData.location}</div>
              </div>
            </GlassCard>
            <GlassCard className="p-8">
              <div className="text-3xl font-semibold">Sosyal</div>
              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryButton onClick={() => openExternalLink(storeData.instagram)}>Instagram</PrimaryButton>
                <PrimaryButton onClick={() => openExternalLink(storeData.whatsapp)}>WhatsApp</PrimaryButton>
              </div>
            </GlassCard>
          </div>
        </main>
      )}

      {page === "auth" && (
        <main className="mx-auto max-w-2xl px-4 py-6">
          <GlassCard className="p-6 sm:p-8">
            <div className="mb-6 text-3xl font-semibold">{authMode === "login" ? "Giriş Yap" : "Kayıt Ol"}</div>
            <div className="mb-4 flex gap-2">
              <SecondaryButton onClick={() => setAuthMode("login")}>Giriş Yap</SecondaryButton>
              <SecondaryButton onClick={() => setAuthMode("register")}>Kayıt Ol</SecondaryButton>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <Field label="Ad soyad">
                  <Input value={authForm.name} onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))} />
                </Field>
              )}
              <Field label="E-posta">
                <Input value={authForm.email} onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))} />
              </Field>
              <Field label="Şifre">
                <Input type="password" value={authForm.password} onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))} />
              </Field>
              {authMode === "register" && (
                <Field label="Şifre tekrar">
                  <Input type="password" value={authForm.confirmPassword} onChange={(e) => setAuthForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
                </Field>
              )}

              {authError ? <div className="text-sm text-red-500">{authError}</div> : null}
              <PrimaryButton type="submit">{authMode === "login" ? "Giriş Yap" : "Kayıt Ol"}</PrimaryButton>
            </form>
          </GlassCard>
        </main>
      )}

      {page === "admin" && isAdmin && (
        <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <GlassCard className="p-8">
              <div className="mb-6 text-3xl font-semibold">{productForm.id ? "Ürün Düzenle" : "Ürün Listele"}</div>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <Field label="Ürün adı"><Input value={productForm.name} onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))} /></Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Kategori">
                    <select value={productForm.category} onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))} className="w-full rounded-2xl border border-white/55 bg-white/28 px-4 py-3 shadow-[0_6px_18px_rgba(255,255,255,0.14),0_6px_16px_rgba(0,0,0,0.04)] backdrop-blur-[24px]">
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Etiket"><Input value={productForm.badge} onChange={(e) => setProductForm((p) => ({ ...p, badge: e.target.value }))} /></Field>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Fiyat"><Input value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} /></Field>
                  <Field label="Eski fiyat"><Input value={productForm.compareAtPrice} onChange={(e) => setProductForm((p) => ({ ...p, compareAtPrice: e.target.value }))} /></Field>
                </div>
                <Field label="Satın al linki"><Input value={productForm.buyLink} onChange={(e) => setProductForm((p) => ({ ...p, buyLink: e.target.value }))} /></Field>
                <Field label="Açıklama"><TextArea rows={4} value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} /></Field>
                <Field label="Ürün görselleri"><input type="file" accept="image/*" multiple onChange={handleProductImagesChange} /></Field>

                {productForm.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {productForm.images.map((img, i) => (
                      <div key={i} className="relative overflow-hidden rounded-2xl border border-black/10">
                        <img src={img} alt="preview" className="h-28 w-full object-cover" />
                        <button type="button" onClick={() => removeProductImage(i)} className="absolute right-2 top-2 rounded-full bg-white px-2 py-1 text-xs">Sil</button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-black/70">
                  <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm((p) => ({ ...p, featured: e.target.checked }))} />
                  Öne çıkan ürün
                </label>

                {productError ? <div className="text-sm text-red-500">{productError}</div> : null}
                {productMessage ? <div className="text-sm text-green-600">{productMessage}</div> : null}

                <div className="flex flex-wrap gap-2">
                  <PrimaryButton type="submit">{productForm.id ? "Ürünü Güncelle" : "Ürünü Listele"}</PrimaryButton>
                  <SecondaryButton type="button" onClick={() => { setProductForm(getEmptyProductForm(categories[0] || "Diğer")); setProductError(""); setProductMessage(""); }}>Temizle</SecondaryButton>
                </div>
              </form>
            </GlassCard>

            <GlassCard className="p-8">
              <div className="mb-6 text-3xl font-semibold">Kategoriler</div>
              <div className="flex gap-2">
                <Input value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="Yeni kategori" />
                <PrimaryButton type="button" onClick={handleAddCategory}>Ekle</PrimaryButton>
              </div>
              {categoryMessage ? <div className="mt-3 text-sm">{categoryMessage}</div> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <div key={c} className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2">
                    <span>{c}</span>
                    <button type="button" onClick={() => handleDeleteCategory(c)}>×</button>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-8">
              <div className="mb-6 text-3xl font-semibold">Mağaza Bilgileri</div>
              <div className="space-y-4">
                <Field label="Logo"><input type="file" accept="image/*" onChange={handleLogoChange} /></Field>
                <Field label="Mağaza adı"><Input value={storeDraft.brandName} onChange={(e) => setStoreDraft((p) => ({ ...p, brandName: e.target.value }))} /></Field>
                <Field label="E-posta"><Input value={storeDraft.email} onChange={(e) => setStoreDraft((p) => ({ ...p, email: e.target.value }))} /></Field>
                <Field label="Telefon"><Input value={storeDraft.phone} onChange={(e) => setStoreDraft((p) => ({ ...p, phone: e.target.value }))} /></Field>
                <Field label="Konum"><Input value={storeDraft.location} onChange={(e) => setStoreDraft((p) => ({ ...p, location: e.target.value }))} /></Field>
                <Field label="Instagram"><Input value={storeDraft.instagram} onChange={(e) => setStoreDraft((p) => ({ ...p, instagram: e.target.value }))} /></Field>
                <Field label="WhatsApp"><Input value={storeDraft.whatsapp} onChange={(e) => setStoreDraft((p) => ({ ...p, whatsapp: e.target.value }))} /></Field>
                <Field label="Slogan"><Input value={storeDraft.slogan} onChange={(e) => setStoreDraft((p) => ({ ...p, slogan: e.target.value }))} /></Field>
                <Field label="Başlık 1"><Input value={storeDraft.homeTitle1} onChange={(e) => setStoreDraft((p) => ({ ...p, homeTitle1: e.target.value }))} /></Field>
                <Field label="Başlık 2"><Input value={storeDraft.homeTitle2} onChange={(e) => setStoreDraft((p) => ({ ...p, homeTitle2: e.target.value }))} /></Field>
                <Field label="Başlık 3"><Input value={storeDraft.homeTitle3} onChange={(e) => setStoreDraft((p) => ({ ...p, homeTitle3: e.target.value }))} /></Field>
                <Field label="Açıklama"><TextArea rows={4} value={storeDraft.homeDescription} onChange={(e) => setStoreDraft((p) => ({ ...p, homeDescription: e.target.value }))} /></Field>
                <Field label="Ana sayfa görseli"><input type="file" accept="image/*" onChange={handleHeroChange} /></Field>
                {storeMessage ? <div className="text-sm">{storeMessage}</div> : null}
                <PrimaryButton type="button" onClick={handleStoreSave}>Kaydet</PrimaryButton>
              </div>
            </GlassCard>
          </div>

          <GlassCard className="p-8">
            <div className="mb-6 text-3xl font-semibold">Ürünler</div>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col gap-4 rounded-[24px] border border-black/10 bg-white p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <img src={product.images?.[0] || DEFAULT_STORE.homeHeroImage} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-black/50">{product.category} • {currency(product.price)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <SecondaryButton onClick={() => handleEditProduct(product)}>Düzenle</SecondaryButton>
                    <SecondaryButton onClick={() => handleDeleteProduct(product.id)}>Sil</SecondaryButton>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </main>
      )}

      <footer className="mt-10 border-t border-white/45 bg-white/38 px-4 py-8 text-sm text-black/60 backdrop-blur-[24px]">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 border-b border-white/35 pb-8 md:grid-cols-3 md:gap-10">
            <div className="text-left">
              <div className="text-[12px] font-semibold uppercase tracking-[0.38em] text-black/55">
                {storeData.brandName}
              </div>
              <p className="mt-5 max-w-xs text-[15px] leading-7 text-black/55">
                Kalitenin en güvenilir adresi.
              </p>
            </div>

            <div className="text-center">
              <div className="text-[12px] font-semibold uppercase tracking-[0.38em] text-black/55">
                Hızlı Erişim
              </div>
              <div className="mt-5 flex flex-col gap-3">
                <button type="button" onClick={() => setPage("home")} className="text-left transition hover:translate-x-1 hover:text-black md:text-center">
                  Anasayfa
                </button>
                <button type="button" onClick={() => setPage("shop")} className="text-left transition hover:translate-x-1 hover:text-black md:text-center">
                  Koleksiyon
                </button>
                <button type="button" onClick={() => setPage("contact")} className="text-left transition hover:translate-x-1 hover:text-black md:text-center">
                  İletişim
                </button>
              </div>
            </div>

            <div className="text-left">
              <div className="text-[12px] font-semibold uppercase tracking-[0.38em] text-black/55">
                İletişim Bilgileri
              </div>
              <div className="mt-5 space-y-3">
                <div>{storeData.email}</div>
                <div>{storeData.phone}</div>
                <div>{storeData.location}</div>
              </div>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => openExternalLink(storeData.instagram)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/18 shadow-[0_8px_18px_rgba(255,255,255,0.12),0_6px_14px_rgba(0,0,0,0.04)] backdrop-blur-[24px] transition duration-300 hover:-translate-y-[1px] hover:bg-white/28"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => openExternalLink(storeData.whatsapp)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/18 shadow-[0_8px_18px_rgba(255,255,255,0.12),0_6px_14px_rgba(0,0,0,0.04)] backdrop-blur-[24px] transition duration-300 hover:-translate-y-[1px] hover:bg-white/28"
                  aria-label="WhatsApp"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 text-center text-[14px] text-black/50">
            © 2026 Aslım Boutique - Tüm hakları saklıdır.
          </div>
        </div>
      </footer>

      <MobileBottomNav page={page} setPage={setPage} isAdmin={isAdmin} currentUser={currentUser} openAuth={openAuth} />
    </div>
  );
}
