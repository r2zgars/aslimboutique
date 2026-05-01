import React, { useEffect, useMemo, useState } from "react";

const ADMIN = {
  email: "admin@aslimboutique.com",
  password: "Aslim2026!",
};

const DB_NAME = "aslim-boutique-db-v10";
const DB_STORE = "kv";
const KEYS = {
  products: "products",
  categories: "categories",
  store: "store",
  users: "users",
  session: "session",
};

const DEFAULT_CATEGORIES = [
  "Elbise",
  "Takım",
  "Ceket",
  "Aksesuar",
  "Ayakkabı",
  "Çanta",
  "Takı",
  "Diğer",
];

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

const DEFAULT_PRODUCTS = [
  {
    id: 101,
    name: "Noir Silk Dress",
    category: "Elbise",
    price: 6490,
    compareAtPrice: 0,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "NEW",
    description: "Akışkan saten dokusu ve sade silüetiyle zarif premium elbise.",
    buyLink: "https://example.com/noir-silk-dress",
    featured: true,
  },
  {
    id: 102,
    name: "Studio Leather Bag",
    category: "Çanta",
    price: 5290,
    compareAtPrice: 0,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "ICON",
    description: "Modern çizgilere sahip güçlü ve zamansız butik çanta.",
    buyLink: "https://example.com/studio-leather-bag",
    featured: true,
  },
  {
    id: 103,
    name: "Maison Black Blazer",
    category: "Ceket",
    price: 7390,
    compareAtPrice: 0,
    images: [
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "EDIT",
    description: "Temiz omuz hattı ve net kesimiyle lüks siyah blazer.",
    buyLink: "https://example.com/maison-black-blazer",
    featured: true,
  },
  {
    id: 104,
    name: "Pearl Line Heels",
    category: "Ayakkabı",
    price: 4690,
    compareAtPrice: 0,
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80",
    ],
    badge: "LIMITED",
    description: "İnce detaylarla tamamlanan zarif ve sofistike topuklu model.",
    buyLink: "https://example.com/pearl-line-heels",
    featured: false,
  },
];

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeProduct(product, fallbackId) {
  const images = Array.isArray(product?.images)
    ? product.images.filter(Boolean)
    : product?.image
      ? [product.image]
      : [];

  return {
    id: product?.id ?? fallbackId ?? Date.now(),
    slug: product?.slug ?? slugify(product?.name ?? ""),
    name: product?.name ?? "",
    category: product?.category ?? "Diğer",
    price: Number(product?.price ?? 0),
    compareAtPrice: Number(product?.compareAtPrice ?? 0),
    images,
    image: images[0] || "",
    badge: product?.badge ?? "NEW",
    description: product?.description ?? "",
    buyLink: product?.buyLink ?? "",
    featured: Boolean(product?.featured),
  };
}

function normalizeProductList(list) {
  return (Array.isArray(list) ? list : []).map((item, index) =>
    normalizeProduct(item, Date.now() + index)
  );
}

function getEmptyProductForm(category) {
  return {
    id: null,
    name: "",
    category: category || "Elbise",
    price: "",
    compareAtPrice: "",
    images: [],
    badge: "NEW",
    description: "",
    buyLink: "",
    featured: false,
  };
}

function runSmokeChecks() {
  console.assert(slugify("Özel Çanta") === "ozel-canta", "slugify testi başarısız");
  const normalized = normalizeProduct({ name: "Deneme", image: "x" }, 1);
  console.assert(Array.isArray(normalized.images), "normalizeProduct images başarısız");
  console.assert(normalized.images.length === 1, "normalizeProduct tek görsel testi başarısız");
}

function openExternalLink(url) {
  if (!url) return;
  try {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!newWindow) window.location.assign(url);
  } catch {
    window.location.assign(url);
  }
}


function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB yok"));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("DB açılamadı"));
  });
}

async function dbGet(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const store = tx.objectStore(DB_STORE);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Okuma hatası"));
  });
}

async function dbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    const request = store.put(value, key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Yazma hatası"));
  });
}

async function dbDelete(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    const request = store.delete(key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Silme hatası"));
  });
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
        if (!ctx) {
          resolve(raw);
          return;
        }
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

function HomeIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10.5V20h14v-9.5" />
      <path d="M10 20v-5h4v5" />
    </IconBase>
  );
}
function StoreIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 8h16l-1 4H5L4 8Z" />
      <path d="M6 12v8h12v-8" />
      <path d="M9 16h6" />
    </IconBase>
  );
}
function SendIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </IconBase>
  );
}
function MenuIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </IconBase>
  );
}
function UserIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.7-3.4 4.3-5 8-5s6.3 1.6 8 5" />
    </IconBase>
  );
}
function LogoutIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </IconBase>
  );
}
function MailIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </IconBase>
  );
}
function PhoneIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.9a2 2 0 0 1-.6 1.7L7.2 10a16 16 0 0 0 6.8 6.8l1.7-1.7a2 2 0 0 1 1.7-.6l2.9.4a2 2 0 0 1 1.7 2Z" />
    </IconBase>
  );
}
function MapPinIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </IconBase>
  );
}
function SearchIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4.2-4.2" />
    </IconBase>
  );
}
function PlusIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </IconBase>
  );
}
function TrashIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m6 6 1 14h10l1-14" />
      <path d="M10 10v6" />
      <path d="M14 10v6" />
    </IconBase>
  );
}
function HeartIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 21s-7-4.4-9-9a5.4 5.4 0 0 1 9-5.4A5.4 5.4 0 0 1 21 12c-2 4.6-9 9-9 9Z" />
    </IconBase>
  );
}
function StarIcon({ className = "h-4 w-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="m12 2.8 2.8 5.6 6.2.9-4.5 4.4 1 6.2L12 17l-5.5 2.9 1-6.2L3 9.3l6.2-.9L12 2.8Z" />
    </svg>
  );
}
function ArrowRightIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  );
}
function InstagramIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.15 1.6 5.96L0 24l6.33-1.66a11.9 11.9 0 0 0 5.74 1.46h.01c6.57 0 11.9-5.33 11.9-11.9 0-3.18-1.24-6.17-3.46-8.42ZM12.08 21.8h-.01a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.76.99 1-3.67-.23-.38a9.87 9.87 0 0 1-1.5-5.25C2.17 6.44 6.62 2 12.07 2c2.64 0 5.12 1.03 6.98 2.89a9.82 9.82 0 0 1 2.88 6.99c0 5.45-4.44 9.9-9.85 9.9Zm5.43-7.42c-.3-.15-1.77-.87-2.04-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.08-.3-.15-1.26-.46-2.41-1.47-.89-.79-1.5-1.76-1.67-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.34.44-.5.15-.17.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.66-1.6-.91-2.19-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.5.08-.76.38-.26.3-1 1-.99 2.43 0 1.43 1.03 2.81 1.18 3 .15.2 2.03 3.1 4.92 4.35.69.3 1.23.48 1.65.62.69.22 1.32.19 1.81.12.55-.08 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z" />
    </svg>
  );
}

function GlassCard({ children, className = "" }) {
  return (
    <div
      className={cx(
        "rounded-[2rem] border border-white/50 bg-white/20 backdrop-blur-[28px] shadow-[0_8px_32px_rgba(255,255,255,0.18),0_18px_60px_rgba(0,0,0,0.08)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function GlassButton({ children, className = "", variant = "solid", ...props }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium tracking-[0.02em] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] sm:px-5 sm:py-3 sm:text-sm";
  const style =
    variant === "outline"
      ? "border border-white/55 bg-white/16 text-black backdrop-blur-[30px] shadow-[0_8px_24px_rgba(255,255,255,0.14)] hover:bg-white/26"
      : "border border-white/65 bg-white/24 text-black backdrop-blur-[30px] shadow-[0_8px_24px_rgba(255,255,255,0.16),0_10px_24px_rgba(0,0,0,0.05)] hover:bg-white/34";
  return (
    <button className={cx(base, style, className)} {...props}>
      {children}
    </button>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={cx(
        "h-12 w-full rounded-full border border-white/50 bg-white/18 px-4 text-black outline-none backdrop-blur-[26px] transition focus:border-black/10 focus:bg-white/30",
        props.className
      )}
    />
  );
}

function MobileSectionHeader({ title, action, onAction }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
      <h3 className="text-base font-semibold text-black">{title}</h3>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          className="rounded-full border border-white/55 bg-white/16 px-3 py-1.5 text-[11px] font-medium text-black backdrop-blur-[28px]"
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}

function NavButton({ item, activePage, setActivePage, setMobileMenuOpen, mobile = false }) {
  const Icon = item.Icon;
  const active = activePage === item.key;
  return (
    <button
      type="button"
      onClick={() => {
        setActivePage(item.key);
        setMobileMenuOpen(false);
      }}
      className={cx(
        "flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02]",
        active
          ? "border border-white/55 bg-white/34 text-black backdrop-blur-[28px] shadow-[0_8px_24px_rgba(255,255,255,0.16)]"
          : "text-black/65 hover:bg-white/24",
        mobile ? "justify-start" : ""
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </button>
  );
}

function MobileCategoryRail({ categories, selectedCategory, setSelectedCategory, className = "" }) {
  return (
    <div className={cx("-mx-1 mt-3", className)}>
      <div className="flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:overflow-visible lg:px-0">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={cx(
              "whitespace-nowrap rounded-full border px-3 py-2 text-[12px] font-medium backdrop-blur-[28px] transition",
              selectedCategory === category
                ? "border-white/60 bg-white/34 text-black"
                : "border-white/45 bg-white/18 text-black/72"
            )}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

function CategoryToggleButton({ isOpen, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full border border-white/55 bg-white/18 px-4 py-2.5 text-[12px] font-medium text-black backdrop-blur-[28px] transition-all duration-300 hover:bg-white/28 sm:text-[13px]",
        className
      )}
    >
      <span className={cx("transition-transform duration-300", isOpen ? "rotate-90" : "rotate-0")}>
        <MenuIcon className="h-4 w-4" />
      </span>
      Kategoriler
    </button>
  );
}

function ProductCard({ product, onOpen }) {
  const cover =
    product.images?.[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80";

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="w-full text-left transition-all duration-300 hover:-translate-y-1"
    >
      <GlassCard className="group h-full overflow-hidden">
        <div className="relative overflow-hidden">
          <img
            src={cover}
            alt={product.name}
            className="h-[220px] w-full object-cover transition duration-700 group-hover:scale-[1.04] sm:h-[300px] lg:h-[420px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-white/55 bg-white/18 px-2.5 py-1 text-[10px] uppercase tracking-[0.28em] text-white backdrop-blur-[28px] sm:left-4 sm:top-4 sm:text-[11px]">
            {product.badge}
          </span>
        </div>
        <div className="space-y-3 p-3.5 sm:space-y-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-black/38 sm:text-[11px] sm:tracking-[0.35em]">
                {product.category}
              </p>
              <h3 className="mt-1.5 line-clamp-2 text-[1rem] font-semibold leading-tight text-black sm:mt-2 sm:text-[1.35rem] lg:text-[1.5rem]">
                {product.name}
              </h3>
            </div>
            <div className="rounded-full border border-white/55 bg-white/24 p-2 text-black backdrop-blur-[28px]">
              <HeartIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <p className="line-clamp-2 min-h-[2.6rem] text-[12px] leading-5 text-black/58 sm:min-h-[3rem] sm:text-sm sm:leading-6">
            {product.description}
          </p>
          <div className="flex items-end justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <span className="text-base font-semibold text-black sm:text-xl">
                {formatCurrency(product.price)}
              </span>
              {product.compareAtPrice ? (
                <span className="ml-2 text-[11px] text-black/30 line-through sm:text-sm">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-black/45 sm:text-sm">
              <StarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> 5.0
            </div>
          </div>
        </div>
      </GlassCard>
    </button>
  );
}

function MobileGlassRail({ items }) {
  return (
    <div className="mt-5 lg:hidden">
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item) => (
          <div
            key={item.title}
            className="min-w-[185px] rounded-[1.45rem] border border-white/55 bg-white/18 p-4 backdrop-blur-[28px] shadow-[0_8px_24px_rgba(255,255,255,0.14)]"
          >
            <p className="text-[10px] uppercase tracking-[0.3em] text-black/38">{item.kicker}</p>
            <p className="mt-2 text-[15px] font-semibold text-black">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DesktopFeatureGrid({ items }) {
  return (
    <div className="mt-8 hidden gap-3 lg:grid lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-[1.4rem] border border-white/50 bg-white/18 p-4 backdrop-blur-[28px] shadow-[0_8px_24px_rgba(255,255,255,0.12)]"
        >
          <p className="text-[10px] uppercase tracking-[0.34em] text-black/36">{item.kicker}</p>
          <p className="mt-2 text-lg font-semibold text-black">{item.title}</p>
        </div>
      ))}
    </div>
  );
}

function MobileBottomNav({ activePage, setActivePage, currentUser, isAdmin, openAuth }) {
  const items = [
    { key: "home", label: "Anasayfa", Icon: HomeIcon, action: () => setActivePage("home") },
    { key: "shop", label: "Koleksiyon", Icon: StoreIcon, action: () => setActivePage("shop") },
    { key: "contact", label: "İletişim", Icon: SendIcon, action: () => setActivePage("contact") },
    {
      key: isAdmin ? "admin" : currentUser ? "account" : "auth",
      label: isAdmin ? "Panel" : currentUser ? "Hesap" : "Giriş",
      Icon: UserIcon,
      action: () => {
        if (isAdmin) return setActivePage("admin");
        if (currentUser) return setActivePage("home");
        openAuth("login");
      },
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/45 bg-white/24 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 backdrop-blur-[28px] lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
        {items.map((item) => {
          const active = activePage === item.key || (item.key === "auth" && activePage === "auth");
          const Icon = item.Icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={item.action}
              className={cx(
                "flex flex-col items-center justify-center gap-1 rounded-[1.2rem] px-2 py-2 text-[10px] font-medium transition-all duration-300",
                active
                  ? "border border-white/60 bg-white/34 text-black shadow-[0_8px_24px_rgba(255,255,255,0.14)]"
                  : "border border-transparent bg-white/10 text-black/65"
              )}
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
  const navItems = [
    { key: "home", label: "Anasayfa", Icon: HomeIcon },
    { key: "shop", label: "Koleksiyon", Icon: StoreIcon },
    { key: "contact", label: "İletişim", Icon: SendIcon },
  ];

  const featureItems = [
    { kicker: "Premium", title: "Seçkin Koleksiyon" },
    { kicker: "Butik", title: "Özel Parçalar" },
    { kicker: "Akış", title: "Direkt Yönlendirme" },
  ];

  const [hydrated, setHydrated] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [activeProductImageIndex, setActiveProductImageIndex] = useState(0);
  const [products, setProducts] = useState(normalizeProductList(DEFAULT_PRODUCTS));
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [storeData, setStoreData] = useState(DEFAULT_STORE);
  const [storeDraft, setStoreDraft] = useState(DEFAULT_STORE);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("featured");
  const [categoryPanelOpen, setCategoryPanelOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [authError, setAuthError] = useState("");
  const [productForm, setProductForm] = useState(getEmptyProductForm(DEFAULT_CATEGORIES[0]));
  const [productError, setProductError] = useState("");
  const [productMessage, setProductMessage] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [storeMessage, setStoreMessage] = useState("");
  const [homeMessage, setHomeMessage] = useState("");

  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    runSmokeChecks();
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      try {
        const db = window.indexedDB;
        if (!db) return;
        const [p, c, s, u, session] = await Promise.all([
          dbGet(KEYS.products).catch(() => null),
          dbGet(KEYS.categories).catch(() => null),
          dbGet(KEYS.store).catch(() => null),
          dbGet(KEYS.users).catch(() => null),
          dbGet(KEYS.session).catch(() => null),
        ]);
        if (cancelled) return;
        if (Array.isArray(p) && p.length) setProducts(normalizeProductList(p));
        if (Array.isArray(c) && c.length) setCategories(c);
        if (s && typeof s === "object") {
          const merged = { ...DEFAULT_STORE, ...s };
          setStoreData(merged);
          setStoreDraft(merged);
        }
        if (Array.isArray(u)) setUsers(u);
        if (session && typeof session === "object") setCurrentUser(session);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (hydrated) {
      dbSet(KEYS.products, products.map((item) => ({ ...item, image: item.images?.[0] || "" }))).catch(() => {});
    }
  }, [hydrated, products]);
  useEffect(() => { if (hydrated) dbSet(KEYS.categories, categories).catch(() => {}); }, [hydrated, categories]);
  useEffect(() => { if (hydrated) dbSet(KEYS.store, storeData).catch(() => {}); }, [hydrated, storeData]);
  useEffect(() => { if (hydrated) dbSet(KEYS.users, users).catch(() => {}); }, [hydrated, users]);
  useEffect(() => {
    if (!hydrated) return;
    if (currentUser) dbSet(KEYS.session, currentUser).catch(() => {});
    else dbDelete(KEYS.session).catch(() => {});
  }, [hydrated, currentUser]);

  useEffect(() => {
    if (!categories.includes(productForm.category)) {
      setProductForm((prev) => ({ ...prev, category: categories[0] || "Diğer" }));
    }
  }, [categories, productForm.category]);

  const featuredProducts = useMemo(() => products.filter((item) => item.featured).slice(0, 6), [products]);
  const allCategories = useMemo(() => ["Tümü", ...categories], [categories]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = products.filter((item) => {
      const matchCategory = selectedCategory === "Tümü" || item.category === selectedCategory;
      const matchSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "priceAsc") return a.price - b.price;
      if (sortBy === "priceDesc") return b.price - a.price;
      if (sortBy === "nameAsc") return a.name.localeCompare(b.name, "tr");
      if (sortBy === "newest") return b.id - a.id;
      return Number(b.featured) - Number(a.featured) || b.id - a.id;
    });
  }, [products, search, selectedCategory, sortBy]);

  function openProduct(product) {
    const normalized = normalizeProduct(product);
    setActiveProduct(normalized);
    setActiveProductImageIndex(0);
    setActivePage("product");
    setMobileMenuOpen(false);
  }

  function openAuth(mode) {
    setAuthMode(mode);
    setAuthError("");
    setActivePage("auth");
    setMobileMenuOpen(false);
  }

  function handleLogout() {
    setCurrentUser(null);
    setActivePage("home");
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
        setActivePage("admin");
        setAuthForm({ name: "", email: "", password: "", confirmPassword: "" });
        return;
      }

      const user = users.find((item) => item.email.toLowerCase() === email && item.password === password);
      if (!user) return setAuthError("E-posta veya şifre hatalı.");

      setCurrentUser({ name: user.name, email: user.email, role: "user" });
      setActivePage("home");
      setAuthForm({ name: "", email: "", password: "", confirmPassword: "" });
      return;
    }

    if (!authForm.name.trim()) return setAuthError("Ad soyad zorunlu.");
    if (password.length < 6) return setAuthError("Şifre en az 6 karakter olmalı.");
    if (password !== authForm.confirmPassword) return setAuthError("Şifreler eşleşmiyor.");
    if (email === ADMIN.email || users.some((item) => item.email.toLowerCase() === email)) {
      return setAuthError("Bu e-posta zaten kullanılıyor.");
    }

    const newUser = { id: Date.now(), name: authForm.name.trim(), email, password, role: "user" };
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser({ name: newUser.name, email: newUser.email, role: "user" });
    setActivePage("home");
    setAuthForm({ name: "", email: "", password: "", confirmPassword: "" });
  }

  async function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const image = await fileToDataUrl(file, 500, 0.9);
    if (image) setStoreDraft((prev) => ({ ...prev, logo: image }));
    e.target.value = "";
  }

  async function handleHeroChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const image = await fileToDataUrl(file, 1800, 0.82);
    if (image) setStoreDraft((prev) => ({ ...prev, homeHeroImage: image }));
    e.target.value = "";
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

  function saveStoreInfo() {
    setStoreData((prev) => ({
      ...prev,
      logo: storeDraft.logo,
      brandName: storeDraft.brandName,
      email: storeDraft.email,
      phone: storeDraft.phone,
      location: storeDraft.location,
      instagram: storeDraft.instagram,
      whatsapp: storeDraft.whatsapp,
    }));
    setStoreMessage("Mağaza bilgileri kaydedildi.");
    setTimeout(() => setStoreMessage(""), 2200);
  }

  function saveHomeSection() {
    setStoreData((prev) => ({
      ...prev,
      slogan: storeDraft.slogan,
      homeTitle1: storeDraft.homeTitle1,
      homeTitle2: storeDraft.homeTitle2,
      homeTitle3: storeDraft.homeTitle3,
      homeDescription: storeDraft.homeDescription,
      featuredTitle: storeDraft.featuredTitle,
      collectionTitle: storeDraft.collectionTitle,
      contactTitle: storeDraft.contactTitle,
      homeHeroImage: storeDraft.homeHeroImage,
    }));
    setHomeMessage("Ana sayfa alanı kaydedildi.");
    setTimeout(() => setHomeMessage(""), 2200);
  }

  function validateProductForm() {
    if (!productForm.name.trim()) return "Ürün adı zorunlu.";
    if (!productForm.price || Number(productForm.price) <= 0) return "Geçerli bir fiyat gir.";
    if (!productForm.images.length) return "En az 1 ürün görseli seç.";
    if (!productForm.buyLink.trim().startsWith("http")) return "Geçerli bir satın al linki gir.";
    if (!productForm.description.trim()) return "Kısa açıklama gir.";
    return "";
  }

  function handleProductSubmit(e) {
    e.preventDefault();
    setProductError("");
    setProductMessage("");

    const error = validateProductForm();
    if (error) return setProductError(error);

    const payload = normalizeProduct({
      id: productForm.id || Date.now(),
      slug: slugify(productForm.name),
      name: productForm.name.trim(),
      category: productForm.category,
      price: Number(productForm.price),
      compareAtPrice: Number(productForm.compareAtPrice || 0),
      images: productForm.images,
      badge: productForm.badge.trim() || "NEW",
      description: productForm.description.trim(),
      buyLink: productForm.buyLink.trim(),
      featured: Boolean(productForm.featured),
    });

    if (productForm.id) {
      setProducts((prev) => prev.map((item) => (item.id === productForm.id ? payload : item)));
      if (activeProduct?.id === payload.id) setActiveProduct(payload);
      setProductMessage("Ürün güncellendi.");
    } else {
      setProducts((prev) => [payload, ...prev]);
      setProductMessage("Ürün listelendi.");
    }

    setProductForm(getEmptyProductForm(categories[0] || "Diğer"));
  }

  function handleEditProduct(product) {
    const normalized = normalizeProduct(product);
    setActivePage("admin");
    setProductError("");
    setProductMessage("");
    setProductForm({
      id: normalized.id,
      name: normalized.name,
      category: normalized.category,
      price: String(normalized.price),
      compareAtPrice: String(normalized.compareAtPrice || ""),
      images: normalized.images || [],
      badge: normalized.badge,
      description: normalized.description,
      buyLink: normalized.buyLink,
      featured: Boolean(normalized.featured),
    });
  }

  function handleDeleteProduct(id) {
    setProducts((prev) => prev.filter((item) => item.id !== id));
    if (productForm.id === id) setProductForm(getEmptyProductForm(categories[0] || "Diğer"));
    if (activeProduct?.id === id) {
      setActiveProduct(null);
      setActivePage("shop");
    }
  }

  function handleAddCategory() {
    const value = categoryInput.trim();
    if (!value) return;
    if (categories.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setCategoryMessage("Bu kategori zaten var.");
      return;
    }
    setCategories((prev) => [...prev, value]);
    setCategoryInput("");
    setCategoryMessage("Kategori eklendi.");
    setTimeout(() => setCategoryMessage(""), 2000);
  }

  function handleDeleteCategory(categoryName) {
    if (categories.length === 1) {
      setCategoryMessage("Son kategori silinemez.");
      return;
    }
    const next = categories.filter((item) => item !== categoryName);
    const fallback = next[0] || "Diğer";
    setCategories(next);
    setProducts((prev) => prev.map((item) => item.category === categoryName ? { ...item, category: fallback } : item));
    if (selectedCategory === categoryName) setSelectedCategory("Tümü");
    if (productForm.category === categoryName) setProductForm((prev) => ({ ...prev, category: fallback }));
    setCategoryMessage("Kategori silindi.");
    setTimeout(() => setCategoryMessage(""), 2000);
  }

  function renderHomePage() {
    return (
      <>
        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
          <div className="grid gap-4 lg:grid-cols-[1.03fr_0.97fr] lg:gap-6">
            <GlassCard className="overflow-hidden">
              <div className="h-full px-4 py-5 sm:px-8 sm:py-10 md:px-10 md:py-14">
                <div className="lg:hidden">
                  <div className="overflow-hidden rounded-[1.6rem] border border-white/55 bg-white/18 shadow-[0_8px_24px_rgba(255,255,255,0.14)] backdrop-blur-[28px]">
                    <img src={storeData.homeHeroImage} alt={storeData.brandName} className="h-[180px] w-full object-cover" />
                  </div>
                </div>

                <p className="mt-4 text-[10px] uppercase tracking-[0.42em] text-black/38 sm:mt-0 sm:text-[11px]">
                  {storeData.slogan}
                </p>

                <h1 className="mt-3 text-[2rem] font-semibold leading-[0.96] tracking-tight text-black sm:text-[2.8rem] lg:mt-4 lg:text-7xl">
                  {storeData.homeTitle1}
                  <span className="block">{storeData.homeTitle2}</span>
                  <span className="block">{storeData.homeTitle3}</span>
                </h1>

                <p className="mt-4 max-w-xl text-[14px] leading-6 text-black/58 sm:mt-5 sm:text-base sm:leading-8">
                  {storeData.homeDescription}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-wrap sm:gap-3">
                  <GlassButton onClick={() => setActivePage("shop")} className="w-full">
                    Koleksiyona Geç <ArrowRightIcon className="h-4 w-4" />
                  </GlassButton>
                  <GlassButton variant="outline" onClick={() => setActivePage("contact")} className="w-full">
                    İletişim
                  </GlassButton>
                </div>

                <MobileGlassRail items={featureItems} />
                <DesktopFeatureGrid items={featureItems} />
              </div>
            </GlassCard>

            <GlassCard className="hidden overflow-hidden lg:block">
              <img src={storeData.homeHeroImage} alt={storeData.brandName} className="h-[760px] w-full object-cover" />
            </GlassCard>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-10 lg:pb-10">
          <MobileSectionHeader title={storeData.featuredTitle} action="Tümü" onAction={() => setActivePage("shop")} />

          <div className="mb-5 hidden flex-col gap-3 sm:flex sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.38em] text-black/35">Signature Selection</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                {storeData.featuredTitle}
              </h2>
            </div>
            <GlassButton variant="outline" onClick={() => setActivePage("shop")}>Hepsi</GlassButton>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4 xl:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onOpen={openProduct} />
            ))}
          </div>
        </section>
      </>
    );
  }

  function renderShopPage() {
    return (
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
        <GlassCard className="p-4 sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4">
            <div className="hidden lg:block">
              <p className="text-[11px] uppercase tracking-[0.4em] text-black/35">Curated Collection</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
                {storeData.collectionTitle}
              </h2>
            </div>

            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
              <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ürün ara" className="pl-11" />
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:items-center sm:gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-12 min-w-0 rounded-full border border-white/45 bg-white/18 px-4 text-[12px] text-black outline-none backdrop-blur-[28px] sm:flex-1 sm:text-[13px]"
              >
                <option value="featured">Öne çıkanlar</option>
                <option value="newest">En yeni</option>
                <option value="priceAsc">Fiyat artan</option>
                <option value="priceDesc">Fiyat azalan</option>
                <option value="nameAsc">İsim A-Z</option>
              </select>

              <CategoryToggleButton
                isOpen={categoryPanelOpen}
                onClick={() => setCategoryPanelOpen((prev) => !prev)}
                className="min-w-[124px]"
              />
            </div>

            <div
              className={cx(
                "grid transition-all duration-300 ease-out",
                categoryPanelOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden origin-top">
                <MobileCategoryRail
                  categories={allCategories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  className="lg:mt-4"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 xl:grid-cols-3 xl:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={openProduct} />
          ))}
        </div>
      </section>
    );
  }

  function renderProductPage() {
    if (!activeProduct) return renderShopPage();

    const gallery = activeProduct.images || [];
    const currentImage = gallery[activeProductImageIndex] || gallery[0] || activeProduct.image;

    return (
      <>
        <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr] lg:gap-6">
            <GlassCard className="overflow-hidden p-4 sm:p-5">
              <img src={currentImage} alt={activeProduct.name} className="h-[360px] w-full rounded-[1.5rem] object-cover sm:h-[520px] lg:h-[760px]" />

              {gallery.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() => setActiveProductImageIndex(index)}
                      className={cx(
                        "overflow-hidden rounded-[1rem] border transition-all duration-300 hover:scale-[1.02]",
                        activeProductImageIndex === index ? "border-black/20" : "border-white/45"
                      )}
                    >
                      <img src={image} alt={`${activeProduct.name} ${index + 1}`} className="h-20 w-full object-cover sm:h-24" />
                    </button>
                  ))}
                </div>
              ) : null}
            </GlassCard>

            <GlassCard className="p-6 sm:p-8 md:p-10">
              <button onClick={() => setActivePage("shop")} className="mb-6 text-sm text-black/42 transition hover:text-black">
                ← Koleksiyona dön
              </button>

              <p className="text-[11px] uppercase tracking-[0.38em] text-black/38">{activeProduct.category}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight text-black sm:text-4xl lg:text-5xl">
                {activeProduct.name}
              </h2>

              <div className="mt-5 flex items-center gap-3">
                <span className="text-2xl font-semibold text-black">{formatCurrency(activeProduct.price)}</span>
                {activeProduct.compareAtPrice ? (
                  <span className="text-base text-black/30 line-through">{formatCurrency(activeProduct.compareAtPrice)}</span>
                ) : null}
              </div>

              <div className="mt-5 inline-flex rounded-full border border-white/55 bg-white/18 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-black/65 backdrop-blur-[28px]">
                {activeProduct.badge}
              </div>

              <p className="mt-7 max-w-xl text-[15px] leading-8 text-black/58 sm:text-base">{activeProduct.description}</p>

              <div className="mt-10 hidden space-y-4 lg:block">
                <a
                  href={activeProduct?.buyLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    openExternalLink(activeProduct?.buyLink);
                  }}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/65 bg-white/24 px-4 py-3 text-[13px] font-medium text-black backdrop-blur-[30px] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/34 sm:text-sm"
                >
                  Satın Al <ArrowRightIcon className="h-4 w-4" />
                </a>

                <GlassButton variant="outline" className="w-full" onClick={() => setActivePage("shop")}>
                  Diğer Ürünler
                </GlassButton>
              </div>
            </GlassCard>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-[74px] z-30 px-4 lg:hidden">
          <GlassCard className="p-3">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-black/45">{activeProduct.name}</p>
                <p className="text-sm font-semibold text-black">{formatCurrency(activeProduct.price)}</p>
              </div>
              <a
                href={activeProduct?.buyLink || "#"}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.preventDefault();
                  openExternalLink(activeProduct?.buyLink);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/65 bg-white/24 px-4 py-3 text-[12px] font-medium text-black backdrop-blur-[30px] transition-all duration-300 hover:bg-white/34"
              >
                Satın Al <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </GlassCard>
        </div>
      </>
    );
  }

  function renderContactPage() {
    return (
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.4em] text-black/35">Contact</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black">{storeData.contactTitle}</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <GlassCard className="p-6 sm:p-8">
            <h3 className="text-2xl font-semibold text-black">Mağaza Bilgileri</h3>
            <p className="mt-3 text-sm leading-7 text-black/55">
              Özel siparişler, ürün yönlendirmeleri ve mağaza detayları için bizimle iletişime geçebilirsin.
            </p>
            <div className="mt-8 space-y-4">
              {[
                [MailIcon, "E-posta", storeData.email],
                [PhoneIcon, "Telefon", storeData.phone],
                [MapPinIcon, "Konum", storeData.location],
              ].map(([Icon, title, value]) => (
                <div key={title} className="flex items-center gap-4 rounded-[1.5rem] border border-white/45 bg-white/18 p-4 backdrop-blur-[28px]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/55 bg-white/28 text-black backdrop-blur-[28px]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-black/40">{title}</p>
                    <p className="font-medium text-black">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-6 sm:p-8">
            <h3 className="text-2xl font-semibold text-black">Sosyal</h3>
            <p className="mt-3 text-sm leading-7 text-black/55">
              Instagram ve WhatsApp üzerinden hızlı erişim ile mağaza bağlantılarını kullanabilirsin.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href={storeData.instagram} target="_blank" rel="noreferrer" className="flex h-14 w-14 items-center justify-center rounded-full border border-white/55 bg-white/22 text-black backdrop-blur-[28px] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.04] hover:bg-white/34">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href={storeData.whatsapp} target="_blank" rel="noreferrer" className="flex h-14 w-14 items-center justify-center rounded-full border border-white/55 bg-white/22 text-black backdrop-blur-[28px] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.04] hover:bg-white/34">
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </GlassCard>
        </div>
      </section>
    );
  }

  function renderAuthPage() {
    return (
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
        <GlassCard className="mx-auto max-w-2xl p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/55 bg-white/28 text-black backdrop-blur-[28px] sm:h-12 sm:w-12">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-black/45">Hesap</p>
              <h2 className="text-2xl font-semibold text-black">{authMode === "login" ? "Giriş Yap" : "Kayıt Ol"}</h2>
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <GlassButton className="w-full sm:w-auto" onClick={() => setAuthMode("login")}>Giriş Yap</GlassButton>
            <GlassButton className="w-full sm:w-auto" variant="outline" onClick={() => setAuthMode("register")}>Kayıt Ol</GlassButton>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" ? (
              <div>
                <label className="mb-2 block text-sm text-black/58">Ad soyad</label>
                <TextInput value={authForm.name} onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm text-black/58">E-posta</label>
              <TextInput value={authForm.email} onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))} />
            </div>

            <div>
              <label className="mb-2 block text-sm text-black/58">Şifre</label>
              <TextInput type="password" value={authForm.password} onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))} />
            </div>

            {authMode === "register" ? (
              <div>
                <label className="mb-2 block text-sm text-black/58">Şifre tekrar</label>
                <TextInput type="password" value={authForm.confirmPassword} onChange={(e) => setAuthForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} />
              </div>
            ) : null}

            {authError ? <p className="text-sm text-red-500">{authError}</p> : null}

            <GlassButton type="submit" className="w-full">
              {authMode === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </GlassButton>
          </form>
        </GlassCard>
      </section>
    );
  }

  function renderAdminPage() {
    if (!isAdmin) return renderAuthPage();

    return (
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-10 lg:py-8">
        <GlassCard className="mb-6 flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-3xl font-semibold tracking-tight text-black">Yönetici Paneli</h2>
          <GlassButton variant="outline" onClick={handleLogout}>
            <LogoutIcon className="h-4 w-4" /> Çıkış Yap
          </GlassButton>
        </GlassCard>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <PlusIcon className="h-5 w-5 text-black" />
                <h3 className="text-2xl font-semibold text-black">{productForm.id ? "Ürün Düzenle" : "Ürün Listele"}</h3>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-black/58">Ürün adı</label>
                  <TextInput value={productForm.name} onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-black/58">Kategori</label>
                    <select value={productForm.category} onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))} className="h-12 w-full rounded-full border border-white/45 bg-white/18 px-4 text-black outline-none backdrop-blur-[28px]">
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-black/58">Etiket</label>
                    <TextInput value={productForm.badge} onChange={(e) => setProductForm((prev) => ({ ...prev, badge: e.target.value }))} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm text-black/58">Fiyat</label>
                    <TextInput value={productForm.price} onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))} />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm text-black/58">Eski fiyat</label>
                    <TextInput value={productForm.compareAtPrice} onChange={(e) => setProductForm((prev) => ({ ...prev, compareAtPrice: e.target.value }))} />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-black/58">Satın al linki</label>
                  <TextInput value={productForm.buyLink} onChange={(e) => setProductForm((prev) => ({ ...prev, buyLink: e.target.value }))} />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-black/58">Kısa açıklama</label>
                  <textarea value={productForm.description} onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))} className="min-h-[120px] w-full rounded-[1.5rem] border border-white/45 bg-white/18 px-4 py-3 text-black outline-none backdrop-blur-[28px]" />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-black/58">Ürün görselleri</label>
                  <input type="file" accept="image/*" multiple onChange={handleProductImagesChange} className="block w-full rounded-full border border-white/45 bg-white/18 px-4 py-3 text-sm text-black file:mr-4 file:rounded-full file:border-0 file:bg-white/60 file:px-4 file:py-2 file:text-black" />

                  {productForm.images.length ? (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {productForm.images.map((image, index) => (
                        <div key={`${image}-${index}`} className="relative overflow-hidden rounded-[1.1rem] border border-white/45">
                          <img src={image} alt={`Önizleme ${index + 1}`} className="h-28 w-full object-cover" />
                          <button type="button" onClick={() => removeProductImage(index)} className="absolute right-2 top-2 rounded-full border border-white/55 bg-white/70 px-2 py-1 text-xs text-black backdrop-blur-[28px]">
                            Sil
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <label className="flex items-center gap-3 rounded-[1.4rem] border border-white/45 bg-white/18 px-4 py-3 text-sm text-black/58 backdrop-blur-[28px]">
                  <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm((prev) => ({ ...prev, featured: e.target.checked }))} />
                  Öne çıkan ürün olarak işaretle
                </label>

                {productError ? <p className="text-sm text-red-500">{productError}</p> : null}
                {productMessage ? <p className="text-sm text-green-600">{productMessage}</p> : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <GlassButton type="submit" className="flex-1">
                    <PlusIcon className="h-4 w-4" />
                    {productForm.id ? "Ürünü Güncelle" : "Ürünü Listele"}
                  </GlassButton>
                  <GlassButton type="button" variant="outline" onClick={() => {
                    setProductForm(getEmptyProductForm(categories[0] || "Diğer"));
                    setProductError("");
                    setProductMessage("");
                  }}>
                    Temizle
                  </GlassButton>
                </div>
              </form>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-2xl font-semibold text-black">Kategoriler</h3>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <TextInput value={categoryInput} onChange={(e) => setCategoryInput(e.target.value)} placeholder="Yeni kategori" />
                <GlassButton type="button" onClick={handleAddCategory}>Ekle</GlassButton>
              </div>
              {categoryMessage ? <p className="mt-3 text-sm text-black/60">{categoryMessage}</p> : null}
              <div className="mt-5 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <div key={category} className="flex items-center gap-2 rounded-full border border-white/45 bg-white/18 px-4 py-2 text-sm text-black backdrop-blur-[28px]">
                    <span>{category}</span>
                    <button type="button" onClick={() => handleDeleteCategory(category)} className="text-black/45 transition hover:text-red-500">×</button>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-2xl font-semibold text-black">Mağaza Bilgileri</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-black/58">Logo</label>
                  <input type="file" accept="image/*" onChange={handleLogoChange} className="block w-full rounded-full border border-white/45 bg-white/18 px-4 py-3 text-sm text-black file:mr-4 file:rounded-full file:border-0 file:bg-white/60 file:px-4 file:py-2 file:text-black" />
                  {storeDraft.logo ? <img src={storeDraft.logo} alt="Logo" className="mt-4 h-20 w-20 rounded-2xl object-cover" /> : null}
                </div>
                {[
                  ["brandName", "Mağaza adı"],
                  ["email", "E-posta"],
                  ["phone", "Telefon"],
                  ["location", "Konum"],
                  ["instagram", "Instagram linki"],
                  ["whatsapp", "WhatsApp linki"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-2 block text-sm text-black/58">{label}</label>
                    <TextInput value={storeDraft[key]} onChange={(e) => setStoreDraft((prev) => ({ ...prev, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              {storeMessage ? <p className="mt-4 text-sm text-green-600">{storeMessage}</p> : null}
              <GlassButton type="button" className="mt-5" onClick={saveStoreInfo}>Kaydet</GlassButton>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-2xl font-semibold text-black">Ana Sayfa Düzenle</h3>
              <div className="mt-5 space-y-4">
                {[
                  ["slogan", "Üst yazı"],
                  ["homeTitle1", "Başlık satır 1"],
                  ["homeTitle2", "Başlık satır 2"],
                  ["homeTitle3", "Başlık satır 3"],
                  ["featuredTitle", "Alt bölüm başlığı"],
                  ["collectionTitle", "Koleksiyon başlığı"],
                  ["contactTitle", "İletişim başlığı"],
                ].map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-2 block text-sm text-black/58">{label}</label>
                    <TextInput value={storeDraft[key]} onChange={(e) => setStoreDraft((prev) => ({ ...prev, [key]: e.target.value }))} />
                  </div>
                ))}
                <div>
                  <label className="mb-2 block text-sm text-black/58">Açıklama</label>
                  <textarea value={storeDraft.homeDescription} onChange={(e) => setStoreDraft((prev) => ({ ...prev, homeDescription: e.target.value }))} className="min-h-[120px] w-full rounded-[1.5rem] border border-white/45 bg-white/18 px-4 py-3 text-black outline-none backdrop-blur-[28px]" />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-black/58">Ana sayfa görseli</label>
                  <input type="file" accept="image/*" onChange={handleHeroChange} className="block w-full rounded-full border border-white/45 bg-white/18 px-4 py-3 text-sm text-black file:mr-4 file:rounded-full file:border-0 file:bg-white/60 file:px-4 file:py-2 file:text-black" />
                  {storeDraft.homeHeroImage ? <img src={storeDraft.homeHeroImage} alt="Ana sayfa" className="mt-4 h-40 w-full rounded-[1.5rem] object-cover" /> : null}
                </div>
              </div>
              {homeMessage ? <p className="mt-4 text-sm text-green-600">{homeMessage}</p> : null}
              <GlassButton type="button" className="mt-5" onClick={saveHomeSection}>Kaydet</GlassButton>
            </GlassCard>
          </div>

          <GlassCard className="p-6">
            <h3 className="text-2xl font-semibold text-black">Ürünler</h3>
            <div className="mt-6 space-y-4">
              {products.map((product) => {
                const cover = product.images?.[0] || product.image || "";
                return (
                  <div key={product.id} className="rounded-[1.5rem] border border-white/45 bg-white/18 p-4 backdrop-blur-[28px]">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-4">
                        <img src={cover} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
                        <div>
                          <h4 className="text-lg font-semibold text-black">{product.name}</h4>
                          <p className="text-sm text-black/50">{product.category} • {formatCurrency(product.price)}</p>
                          <p className="mt-1 text-xs text-black/32">{product.images?.length || 0} görsel</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <GlassButton variant="outline" onClick={() => handleEditProduct(product)}>Düzenle</GlassButton>
                        <GlassButton variant="outline" className="border-red-200 text-red-500 hover:bg-red-50/40" onClick={() => handleDeleteProduct(product.id)}>
                          <TrashIcon className="h-4 w-4" /> Sil
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </section>
    );
  }

  function renderPage() {
    if (activePage === "shop") return renderShopPage();
    if (activePage === "product") return renderProductPage();
    if (activePage === "contact") return renderContactPage();
    if (activePage === "auth") return renderAuthPage();
    if (activePage === "admin") return renderAdminPage();
    return renderHomePage();
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f0eb] pb-24 text-black lg:pb-0">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_24%),radial-gradient(circle_at_right,rgba(255,255,255,0.35),transparent_26%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.04),transparent_22%)]" />

      <header className="sticky top-0 z-50 border-b border-white/45 bg-white/18 backdrop-blur-[28px]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-4 sm:gap-4 sm:px-6 lg:px-10">
          <button onClick={() => setActivePage("home")} className="flex min-w-0 flex-1 items-center gap-2 text-left sm:gap-3">
            <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-2xl border border-white/55 bg-white/18 shadow-[0_8px_24px_rgba(255,255,255,0.14),0_8px_24px_rgba(0,0,0,0.06)] backdrop-blur-[28px]">
              {storeData.logo ? (
                <img src={storeData.logo} alt={`${storeData.brandName} logo`} className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/45">Logo</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] uppercase tracking-[0.28em] text-black/35 sm:text-[11px] sm:tracking-[0.45em]">r2 development</p>
              <h1 className="text-[1.05rem] font-semibold tracking-[0.08em] text-black sm:text-lg sm:tracking-[0.14em]">{storeData.brandName}</h1>
            </div>
          </button>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <NavButton key={item.key} item={item} activePage={activePage} setActivePage={setActivePage} setMobileMenuOpen={setMobileMenuOpen} />
            ))}
          </nav>

          <div className="flex flex-none items-center gap-2 sm:gap-3">
            {!currentUser ? (
              <>
                <GlassButton variant="outline" className="hidden md:inline-flex" onClick={() => openAuth("login")}>
                  Giriş Yap
                </GlassButton>
                <GlassButton className="hidden md:inline-flex" onClick={() => openAuth("register")}>
                  Kayıt Ol
                </GlassButton>
              </>
            ) : (
              <>
                {isAdmin ? (
                  <GlassButton variant="outline" className="hidden md:inline-flex" onClick={() => setActivePage("admin")}>
                    Yönetici Paneli
                  </GlassButton>
                ) : (
                  <div className="hidden rounded-full border border-white/55 bg-white/18 px-4 py-2 text-sm text-black/70 backdrop-blur-[28px] md:block">
                    {currentUser.name}
                  </div>
                )}
                <GlassButton variant="outline" className="hidden md:inline-flex" onClick={handleLogout}>
                  <LogoutIcon className="h-4 w-4" /> Çıkış
                </GlassButton>
              </>
            )}

            <button
              type="button"
              className="rounded-full border border-white/55 bg-white/18 p-2 text-black backdrop-blur-[28px] lg:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <div className="border-t border-white/45 bg-white/18 px-4 py-4 backdrop-blur-[28px] sm:px-6 lg:hidden">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavButton key={item.key} item={item} activePage={activePage} setActivePage={setActivePage} setMobileMenuOpen={setMobileMenuOpen} mobile />
              ))}

              {!currentUser ? (
                <>
                  <button onClick={() => openAuth("login")} className="rounded-full border border-white/55 bg-white/16 px-3 py-2 text-left text-[12px] text-black/75 backdrop-blur-[28px] transition hover:bg-white/26">
                    Giriş Yap
                  </button>
                  <button onClick={() => openAuth("register")} className="rounded-full border border-white/55 bg-white/16 px-3 py-2 text-left text-[12px] text-black/75 backdrop-blur-[28px] transition hover:bg-white/26">
                    Kayıt Ol
                  </button>
                </>
              ) : (
                <>
                  {isAdmin ? (
                    <button onClick={() => { setActivePage("admin"); setMobileMenuOpen(false); }} className="rounded-full border border-white/55 bg-white/16 px-3 py-2 text-left text-[12px] text-black/75 backdrop-blur-[28px] transition hover:bg-white/26">
                      Yönetici Paneli
                    </button>
                  ) : null}
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="rounded-full border border-white/55 bg-white/16 px-3 py-2 text-left text-[12px] text-black/75 backdrop-blur-[28px] transition hover:bg-white/26">
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}

        {!currentUser ? (
          <div className="border-t border-white/45 bg-white/10 px-4 py-3 backdrop-blur-[28px] lg:hidden">
            <div className="grid grid-cols-2 gap-2">
              <GlassButton variant="outline" className="w-full" onClick={() => openAuth("login")}>
                Giriş Yap
              </GlassButton>
              <GlassButton className="w-full" onClick={() => openAuth("register")}>
                Kayıt Ol
              </GlassButton>
            </div>
          </div>
        ) : null}
      </header>

      <main className="relative z-10">{renderPage()}</main>

      <MobileBottomNav
        activePage={activePage}
        setActivePage={setActivePage}
        currentUser={currentUser}
        isAdmin={isAdmin}
        openAuth={openAuth}
      />

      <footer className="relative z-10 mt-10 border-t border-white/45 bg-white/18 backdrop-blur-[28px]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-10">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-black/55">{storeData.brandName}</h3>
            <p className="mt-3 text-sm leading-7 text-black/55">Kalitenin en güvenilir adresi.</p>
          </div>

          <div className="text-center lg:flex lg:flex-col lg:items-center">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-black/55">Hızlı Erişim</h3>
            <div className="mt-3 flex flex-col items-center gap-3 text-sm text-black/70">
              <button onClick={() => setActivePage("home")} className="text-center transition hover:text-black">Anasayfa</button>
              <button onClick={() => setActivePage("shop")} className="text-center transition hover:text-black">Koleksiyon</button>
              <button onClick={() => setActivePage("contact")} className="text-center transition hover:text-black">İletişim</button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-black/55">İletişim Bilgileri</h3>
            <div className="mt-3 space-y-2 text-sm text-black/70">
              <p>{storeData.email}</p>
              <p>{storeData.phone}</p>
              <p>{storeData.location}</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <a href={storeData.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-white/55 bg-white/22 p-3 text-black backdrop-blur-[28px] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.04] hover:bg-white/34">
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a href={storeData.whatsapp} target="_blank" rel="noreferrer" className="rounded-full border border-white/55 bg-white/22 p-3 text-black backdrop-blur-[28px] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.04] hover:bg-white/34">
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/45 px-6 py-5 text-center text-sm text-black/55 lg:px-10">
          © 2026 Aslım Boutique - Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
