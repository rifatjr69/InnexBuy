import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Sparkles, ShieldCheck, Truck, RefreshCw, Phone,
  Flame, Clock, CheckCircle2, SlidersHorizontal, Heart, ShoppingBag,
  Tag, Search, User as UserIcon, ChevronLeft, ChevronRight, Settings,
  MoreVertical, PackageCheck, LogOut
} from 'lucide-react';
import { Product, Category, Banner, DeliveryZone, Coupon, CartItem, Order } from './types';
import {
  MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BANNERS,
  MOCK_DELIVERY_ZONES, MOCK_COUPONS
} from './data/mockProducts';
import { supabase } from './lib/supabase';
import { initTracking, trackEvent } from './lib/analytics';
import { syncMockDataToSupabase } from './lib/syncSupabase';

import { ProductCard } from './components/ProductCard';
import { ProductPage } from './components/ProductPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { AuthModal } from './components/AuthModal';
import { WishlistPage } from './components/WishlistPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AccountPage } from './components/AccountPage';
import { Footer } from './components/Footer';

// ====== এখানে আপনার স্টোরের নাম, থিম কালার ও হটলাইন বদলাতে পারবেন ======
const STORE_NAME = 'innexbuy';
const HOTLINE = '0 1982-71166800';
const BRAND = '#EC2A6B'; // মেইন পিংক কালার
const PILL_COLORS = ['#1D4ED8', '#E6127F', '#8B3FD9', '#0EA5A4', '#166B4D', '#F97316'];
const NO_SCROLLBAR = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

// লোগোর ছবি ফাইল ব্যবহার করতে চাইলে এখানে পাথ দিন (যেমন '/logo.png')।
// ফাঁকা রাখলে নিচের বিল্ট-ইন innexbuy লোগো (কার্ট আইকন + নাম) দেখাবে।
const LOGO_IMAGE = '';

const toBn = (n: number | string) =>
  String(n).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

/* ------------------------------------------------------------------ */
/* Logo: গোলাপি স্পিড-কার্ট আইকন + "innexbuy" ওয়ার্ডমার্ক                    */
/* ------------------------------------------------------------------ */
const Logo: React.FC<{ className?: string }> = ({ className = '' }) => {
  if (LOGO_IMAGE) {
    return <img src={LOGO_IMAGE} alt={STORE_NAME} className={`h-8 sm:h-10 w-auto object-contain ${className}`} />;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 sm:gap-2 select-none ${className}`} aria-label={STORE_NAME}>
      <svg viewBox="0 0 60 56" className="h-8 sm:h-10 w-auto shrink-0" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="ib-cart-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF0A5C" />
            <stop offset="65%" stopColor="#FF0A5C" />
            <stop offset="100%" stopColor="#D8085A" />
          </linearGradient>
        </defs>
        {/* স্পিড লাইন */}
        <g stroke="#FF0A5C" strokeWidth="3.6" strokeLinecap="round">
          <line x1="3" y1="17" x2="13" y2="17" />
          <line x1="7" y1="24" x2="18" y2="24" />
          <line x1="12" y1="31" x2="19" y2="31" />
        </g>
        {/* কার্টের হ্যান্ডেল */}
        <path d="M17 6.5h5.5a2 2 0 0 1 1.95 1.55L28 23" fill="none" stroke="#FF0A5C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {/* বাস্কেট */}
        <path d="M24.5 13.5h28.2c2.4 0 3.9 2.1 3.2 4.3l-4.6 14.4c-.6 1.8-2.2 3-4.1 3H31.3z" fill="url(#ib-cart-grad)" />
        {/* নিচের বার */}
        <path d="M32 35.2c-3.6 0-5.2 2.2-4.6 5.3h19.2" fill="none" stroke="#FF0A5C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {/* চাকা */}
        <circle cx="31" cy="49" r="3.7" fill="#FF0A5C" />
        <circle cx="44" cy="49" r="3.7" fill="#FF0A5C" />
      </svg>
      <span className="font-black lowercase text-[22px] sm:text-[28px] leading-none tracking-tight text-slate-900">
        {STORE_NAME}
      </span>
    </span>
  );
};

export default function App() {
  // 1. Data States
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(MOCK_BANNERS);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(MOCK_DELIVERY_ZONES);
  const [coupons] = useState<Coupon[]>(MOCK_COUPONS);

  // 2. Navigation & Filter States
  const [activeTab, setActiveTab] = useState<'home' | 'shop'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'rating'>('default');
  const [slideIndex, setSlideIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');
  const [moreOpen, setMoreOpen] = useState(false); // মোবাইল ৩-ডট মেনু
  const categoryScrollRef = useRef<HTMLDivElement>(null);
  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // 3. User & Cart States
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('muba_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('muba_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedZone, setSelectedZone] = useState<DeliveryZone>(MOCK_DELIVERY_ZONES[0]);
  const [checkoutDiscount, setCheckoutDiscount] = useState(0);
  const [checkoutCouponCode, setCheckoutCouponCode] = useState('');

  // 4. Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(() => {
    try {
      return window.location.pathname === '/account' || window.location.hash === '#account';
    } catch {
      return false;
    }
  });
  const [isAdminOpen, setIsAdminOpen] = useState(() => {
    try {
      const query = new URLSearchParams(window.location.search);
      const isExplicitAdminUrl = window.location.pathname === '/admin' || window.location.hash === '#admin';
      if (isExplicitAdminUrl) return true;
      if (localStorage.getItem('muba_admin_logged_out') === 'true') return false;
      return query.get('tab') !== null;
    } catch {
      return false;
    }
  });
  const [orderToast, setOrderToast] = useState<string | null>(null);

  // 5. Supabase Fetching
  const refreshProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setProducts(data);
      } else {
        setProducts(MOCK_PRODUCTS);
        syncMockDataToSupabase().then((res) => {
          if (res.success && res.count > 0) {
            supabase.from('products').select('*').order('created_at', { ascending: false }).then(({ data: fresh }: { data: any }) => {
              if (fresh && fresh.length > 0) setProducts(fresh);
            });
          }
        });
      }
    } catch {
      setProducts(MOCK_PRODUCTS);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) setCategories(data);
      else setCategories(MOCK_CATEGORIES);
    } catch {
      setCategories(MOCK_CATEGORIES);
    }
  }, []);

  const refreshBanners = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('banners').select('*').order('sort_order', { ascending: true });
      if (!error && data && data.length > 0) setBanners(data);
      else setBanners(MOCK_BANNERS);
    } catch {
      setBanners(MOCK_BANNERS);
    }
  }, []);

  const refreshDeliveryZones = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('delivery_zones').select('*').order('charge', { ascending: true });
      if (!error && data && data.length > 0) {
        setDeliveryZones(data);
        setSelectedZone(data[0]);
      } else {
        setDeliveryZones(MOCK_DELIVERY_ZONES);
        setSelectedZone(MOCK_DELIVERY_ZONES[0]);
      }
    } catch {
      setDeliveryZones(MOCK_DELIVERY_ZONES);
      setSelectedZone(MOCK_DELIVERY_ZONES[0]);
    }
  }, []);

  const checkUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!error && data) {
        if (data.role === 'admin') {
          setIsAdmin(true);
          try {
            localStorage.removeItem('muba_admin_logged_out');
          } catch {}
          if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
            setIsAdminOpen(true);
          }
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Error checking user role:', err);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    initTracking();
    refreshProducts();
    refreshCategories();
    refreshBanners();
    refreshDeliveryZones();

    if (window.location.pathname === '/admin' || window.location.hash === '#admin') {
      setIsAdminOpen(true);
    }

    supabase.auth.getUser().then(({ data }: any) => {
      if (data?.user) {
        setUser(data.user);
        checkUserRole(data.user.id);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [refreshProducts, refreshCategories, refreshBanners, refreshDeliveryZones, checkUserRole]);

  useEffect(() => {
    try { localStorage.setItem('muba_cart', JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem('muba_wishlist', JSON.stringify(wishlist)); } catch { /* ignore */ }
  }, [wishlist]);

  // Hero auto slide
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setSlideIndex((i) => (i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [banners.length]);

  // Flash sale countdown (দিনের শেষ পর্যন্ত)
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setTimeLeft(toBn(`${h}:${m}:${s}`));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // মোবাইল ৩-ডট মেনু: Esc চাপলে বা স্ক্রিন বড় হলে বন্ধ
  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMoreOpen(false); };
    const onResize = () => { if (window.innerWidth >= 768) setMoreOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [moreOpen]);

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1, variant?: string) => {
    trackEvent('add_to_cart');
    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === variant
      );
      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx] = { ...next[existingIdx], quantity: next[existingIdx].quantity + quantity };
        return next;
      }
      return [...prev, { product, quantity, selectedVariant: variant }];
    });
    setOrderToast(`"${product.name}" কার্টে যোগ করা হয়েছে`);
    setTimeout(() => setOrderToast(null), 3000);
  };

  const handleUpdateQuantity = (productId: string, delta: number, variant?: string) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.selectedVariant === variant) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string, variant?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.selectedVariant === variant))
    );
  };

  const handleOrderNow = (product: Product, quantity: number = 1, variant?: string) => {
    handleAddToCart(product, quantity, variant);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    trackEvent('checkout_start');
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleProceedToCheckout = (discountAmount: number, couponCode: string) => {
    setCheckoutDiscount(discountAmount);
    setCheckoutCouponCode(couponCode);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
    trackEvent('checkout_start');
  };

  const handleOrderSuccess = (_order: Order) => {
    trackEvent('purchase');
    setCart([]);
    setCheckoutDiscount(0);
    setCheckoutCouponCode('');
  };

  // Derived values
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);
  const cartTotal = useMemo(
    () => cart.reduce((s, i) => s + (Number((i.product as any).price) || 0) * i.quantity, 0),
    [cart]
  );

  const filteredProducts = useMemo(() => {
    const selectedCatObj = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
    const selectedCatId = selectedCatObj?.id;
    const selectedCatSlug = selectedCatObj?.slug || selectedCategory;

    return products
      .filter((p) => {
        const matchCat =
          selectedCategory === 'all' ||
          p.category === selectedCatSlug ||
          (selectedCatId && p.category_id === selectedCatId) ||
          p.category_id === selectedCategory ||
          p.category === selectedCategory ||
          (p as any).categories?.slug === selectedCategory;

        const q = searchFilter.toLowerCase();
        const matchSearch =
          !searchFilter ||
          (p.name || '').toLowerCase().includes(q) ||
          (p.name_bn || '').toLowerCase().includes(q) ||
          (p.short_description || '').toLowerCase().includes(q);

        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, categories, selectedCategory, searchFilter, sortBy]);

  const searchSuggestions = useMemo(() => {
    if (!searchFilter.trim()) return [];
    const q = searchFilter.toLowerCase();
    return products
      .filter((p) => (p.name || '').toLowerCase().includes(q) || (p.name_bn || '').toLowerCase().includes(q))
      .slice(0, 6);
  }, [products, searchFilter]);

  const flashSaleProducts = useMemo(() => products.filter((p) => p.is_flash_sale), [products]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter((p) => p.id !== selectedProduct.id && (p.category_id === selectedProduct.category_id || p.category === selectedProduct.category))
      .slice(0, 4);
  }, [products, selectedProduct]);

  // Admin handlers
  const handleAdminLogout = useCallback(async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    try {
      localStorage.removeItem('muba_admin_active');
      localStorage.removeItem('muba_admin_tab');
      localStorage.setItem('muba_admin_logged_out', 'true');
      window.history.replaceState({}, '', '/');
    } catch { /* ignore */ }
    setUser(null);
    setIsAdmin(false);
    setIsAdminOpen(false);
    setOrderToast('অ্যাডমিন প্যানেল থেকে সফলভাবে লগআউট হয়েছে!');
    setTimeout(() => setOrderToast(null), 3500);
  }, []);

  const handleUserLogout = async () => {
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
    setUser(null);
    setIsAdmin(false);
    setOrderToast('সফলভাবে লগআউট হয়েছে');
    setTimeout(() => setOrderToast(null), 3000);
  };

  const handleUserButton = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    if (isAdmin) {
      setIsAdminOpen(true);
      try { window.history.pushState({}, '', '/admin'); } catch {}
    } else {
      setIsAccountOpen(true);
      try { window.history.pushState({}, '', '/account'); } catch { /* ignore */ }
    }
  };

  const goHome = () => {
    setActiveTab('home');
    setSelectedCategory('all');
    setSearchFilter('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategory = (slug: string) => {
    setSelectedCategory(slug);
    setActiveTab('shop');
    setSearchFilter('');
  };

  // Admin page
  if (isAdminOpen) {
    return (
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          try { window.history.replaceState({}, '', '/'); } catch { /* ignore */ }
        }}
        onLogout={handleAdminLogout}
        products={products}
        categories={categories}
        banners={banners}
        deliveryZones={deliveryZones}
        onRefreshProducts={refreshProducts}
        onRefreshCategories={refreshCategories}
        onRefreshBanners={refreshBanners}
        onRefreshDeliveryZones={refreshDeliveryZones}
      />
    );
  }

  // Wishlist page
  if (isWishlistOpen) {
    return (
      <WishlistPage
        onClose={() => setIsWishlistOpen(false)}
        products={products}
        wishlistIds={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p, q) => handleAddToCart(p, q)}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsWishlistOpen(false);
        }}
      />
    );
  }

  // Account page
  if (isAccountOpen) {
    return (
      <AccountPage
        user={user}
        onClose={() => {
          setIsAccountOpen(false);
          try { window.history.replaceState({}, '', '/'); } catch { /* ignore */ }
        }}
        onLogout={async () => {
          try { await supabase.auth.signOut(); } catch { /* ignore */ }
          setUser(null);
          setIsAccountOpen(false);
          try { window.history.replaceState({}, '', '/'); } catch { /* ignore */ }
        }}
        products={products}
        wishlistIds={wishlist}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={(p, q) => handleAddToCart(p, q)}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          setIsAccountOpen(false);
        }}
      />
    );
  }

  const currentBanner: any = banners[slideIndex] || null;
  const bannerImage = currentBanner?.image_url || currentBanner?.image || currentBanner?.image_mobile_url;
  const bannerLink = currentBanner?.link_url || currentBanner?.link || currentBanner?.url || '';

  const handleBannerClick = (url: string) => {
    if (url.includes('tws-earbuds')) openCategory('tws-earbuds');
    else if (url.includes('smartwatches')) openCategory('smartwatches');
    else setActiveTab('shop');
  };

  const closeMore = () => setMoreOpen(false);
  const userLabel = user
    ? (user.user_metadata?.full_name || user.email || 'আমার একাউন্ট')
    : 'স্বাগতম!';

  // সার্চ বক্স (ডেস্কটপ ও মোবাইল দুই জায়গায় ব্যবহার হয়)
  const renderSearch = (placeholder: string) => (
    <div className="relative w-full">
      <div
        className="flex items-center gap-2 rounded-full border-2 px-4 h-10 bg-white transition-colors"
        style={{ borderColor: isSearchFocused ? BRAND : '#F9A8C4' }}
      >
        <Search className="w-4 h-4 text-slate-700 shrink-0" />
        <input
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={searchFilter}
          onChange={(e) => {
            setSearchFilter(e.target.value);
            if (e.target.value) setActiveTab('shop');
          }}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
          placeholder={placeholder}
          className="w-full min-w-0 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        {searchFilter && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setSearchFilter('')}
            aria-label="Clear search"
            className="shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs leading-none flex items-center justify-center hover:bg-slate-200"
          >
            ×
          </button>
        )}
      </div>
      {isSearchFocused && searchSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
          {searchSuggestions.map((p) => (
            <button
              key={p.id}
              type="button"
              onPointerDown={() => {
                setSelectedProduct(p);
                setSearchFilter('');
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-pink-50 active:bg-pink-100 text-sm border-b border-slate-50 last:border-0"
            >
              {p.image_url && (
                <img
                  src={p.image_url}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100 shrink-0"
                  onError={(e) => ((e.target as HTMLImageElement).style.visibility = 'hidden')}
                />
              )}
              <span className="flex-1 min-w-0 truncate font-medium text-slate-800">{p.name_bn || p.name}</span>
              <span className="font-bold shrink-0" style={{ color: BRAND }}>৳{toBn(p.price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ৩-ডট মেনুর একটি আইটেম
  const menuItem = (
    key: string,
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    tone: 'default' | 'brand' | 'admin' | 'danger' = 'default',
    badge?: string
  ) => {
    const toneClass =
      tone === 'brand'
        ? 'text-[#EC2A6B] bg-pink-50 hover:bg-pink-100'
        : tone === 'admin'
          ? 'text-purple-700 bg-purple-50 hover:bg-purple-100'
          : tone === 'danger'
            ? 'text-red-600 hover:bg-red-50'
            : 'text-slate-800 hover:bg-slate-50 active:bg-slate-100';
    return (
      <button
        key={key}
        type="button"
        role="menuitem"
        onClick={() => { onClick(); closeMore(); }}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition ${toneClass}`}
      >
        <span className="w-5 h-5 flex items-center justify-center shrink-0">{icon}</span>
        <span className="flex-1 text-left">{label}</span>
        {badge && (
          <span
            className="text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1.5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: BRAND }}
          >
            {badge}
          </span>
        )}
        <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans" style={{ ['--brand' as any]: BRAND }}>
      {/* Toast */}
      {orderToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[92vw] bg-gray-900/95 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 backdrop-blur border border-gray-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{orderToast}</span>
        </div>
      )}

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
        <div className="max-w-[1100px] mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-2 sm:gap-3 h-14 md:h-[68px]">
            {/* Logo */}
            <button
              type="button"
              onClick={goHome}
              aria-label={`${STORE_NAME} হোম`}
              className="shrink-0 focus:outline-none"
            >
              <Logo />
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('shop'); setSelectedCategory('all'); }}
              className="hidden md:block text-[13px] font-bold tracking-wide text-slate-800 hover:text-[var(--brand)] transition"
            >
              SHOP
            </button>

            {/* Search (ডেস্কটপ) */}
            <div className="hidden md:block flex-1 max-w-[360px]">
              {renderSearch('সার্চ করুন...')}
            </div>

            {/* Action pills */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* WISHLIST (ডেস্কটপ) */}
              <button
                type="button"
                onClick={() => setIsWishlistOpen(true)}
                className="hidden md:inline-flex items-center gap-1.5 bg-slate-900 text-white text-[11px] font-black tracking-wide h-10 px-4 rounded-full hover:bg-slate-700 transition"
              >
                <Heart className="w-3.5 h-3.5" />
                WISHLIST{wishlist.length > 0 && <span>({toBn(wishlist.length)})</span>}
              </button>

              {/* LOGIN / ACCOUNT / ADMIN (ডেস্কটপ) */}
              <button
                type="button"
                onClick={handleUserButton}
                className="hidden md:inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-[11px] font-black tracking-wide h-10 px-4 rounded-full hover:bg-slate-200 transition"
              >
                {!user ? 'LOGIN' : isAdmin ? 'ADMIN' : 'ACCOUNT'}
              </button>

              {/* BAG */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label="Cart"
                className="relative inline-flex items-center justify-center gap-2 text-white text-[11px] font-black tracking-wide w-10 h-10 md:w-auto md:px-4 rounded-full shadow-sm hover:opacity-90 active:opacity-80 transition"
                style={{ backgroundColor: BRAND }}
              >
                <ShoppingBag className="w-[18px] h-[18px] md:w-3.5 md:h-3.5" />
                <span className="hidden md:inline">BAG</span>
                <span
                  className="hidden md:flex bg-white rounded-full min-w-[20px] h-5 px-1 items-center justify-center text-[10px]"
                  style={{ color: BRAND }}
                >
                  {toBn(cartCount)}
                </span>
                {cartCount > 0 && (
                  <span className="md:hidden absolute -top-1 -right-1 bg-slate-900 text-white text-[9px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center ring-2 ring-white">
                    {cartCount > 99 ? '99+' : toBn(cartCount)}
                  </span>
                )}
              </button>

              {/* ৩-ডট মেনু (শুধু মোবাইল/ট্যাবলেট) */}
              <div className="relative md:hidden">
                <button
                  type="button"
                  onClick={() => setMoreOpen((v) => !v)}
                  aria-label="আরও অপশন"
                  aria-haspopup="menu"
                  aria-expanded={moreOpen}
                  className={`relative z-50 inline-flex items-center justify-center w-10 h-10 rounded-full transition ${
                    moreOpen ? 'bg-pink-50 text-[var(--brand)]' : 'text-slate-800 hover:bg-slate-100 active:bg-slate-200'
                  }`}
                >
                  <MoreVertical className="w-5 h-5" />
                  {wishlist.length > 0 && !moreOpen && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white" style={{ backgroundColor: BRAND }} />
                  )}
                </button>

                {moreOpen && (
                  <>
                    {/* বাইরে ক্লিক করলে বন্ধ */}
                    <div className="fixed inset-0 z-40 bg-slate-900/20" onClick={closeMore} aria-hidden="true" />
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-2 w-[17rem] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50"
                    >
                      {/* ইউজার কার্ড */}
                      <button
                        type="button"
                        onClick={() => { handleUserButton(); closeMore(); }}
                        className="w-full flex items-center gap-3 p-3 mb-1 rounded-xl bg-gradient-to-r from-pink-50 to-white border border-pink-100 text-left"
                      >
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{ backgroundColor: BRAND }}
                        >
                          <UserIcon className="w-5 h-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-slate-900 truncate">{userLabel}</span>
                          <span className="block text-[11px] font-medium" style={{ color: BRAND }}>
                            {!user ? 'লগইন / সাইন আপ করুন' : isAdmin ? 'অ্যাডমিন প্যানেলে যান' : 'একাউন্ট দেখুন'}
                          </span>
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                      </button>

                      {menuItem(
                        'wishlist',
                        <Heart className="w-[18px] h-[18px] text-slate-500" />,
                        'পছন্দের তালিকা',
                        () => setIsWishlistOpen(true),
                        'default',
                        wishlist.length > 0 ? toBn(wishlist.length) : undefined
                      )}
                      {menuItem(
                        'tracking',
                        <PackageCheck className="w-[18px] h-[18px] text-slate-500" />,
                        'অর্ডার ট্র্যাকিং',
                        () => setIsTrackingOpen(true)
                      )}

                      {isAdmin && menuItem(
                        'admin',
                        <Settings className="w-[18px] h-[18px]" />,
                        'অ্যাডমিন প্যানেল',
                        () => setIsAdminOpen(true),
                        'admin'
                      )}
                      {user && menuItem(
                        'logout',
                        <LogOut className="w-[18px] h-[18px]" />,
                        'লগআউট',
                        handleUserLogout,
                        'danger'
                      )}

                      <div className="h-px bg-slate-100 my-2" />
                      <a
                        href={`tel:${HOTLINE}`}
                        onClick={closeMore}
                        role="menuitem"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-[13px] font-bold shadow-sm active:opacity-80"
                        style={{ backgroundColor: BRAND }}
                      >
                        <Phone className="w-4 h-4" /> কল করুন: {HOTLINE}
                      </a>
                      <p className="text-center text-[10px] text-slate-400 font-medium mt-2 mb-0.5">
                        ১০০% আসল প্রোডাক্ট • ৭ দিনের রিপ্লেসমেন্ট
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-2.5">
            {renderSearch('গ্যাজেট সার্চ করুন...')}
          </div>

          {/* Category nav (ডেস্কটপ) */}
          <nav className={`hidden md:flex items-center gap-1 overflow-x-auto pb-3 pt-1 border-t border-slate-100 ${NO_SCROLLBAR}`}>
            <button
              type="button"
              onClick={goHome}
              className={`shrink-0 text-[13px] font-semibold px-3 py-1.5 rounded-full transition ${
                selectedCategory === 'all' && activeTab === 'home' ? 'text-[var(--brand)]' : 'text-slate-700 hover:text-[var(--brand)]'
              }`}
            >
              হোম
            </button>
            {categories.map((cat, idx) => {
              const isPill = idx >= 5;
              const color = PILL_COLORS[(idx - 5) % PILL_COLORS.length];
              const active = selectedCategory === cat.slug;
              return isPill ? (
                <button
                  type="button"
                  key={cat.id || cat.slug}
                  onClick={() => openCategory(cat.slug)}
                  className={`shrink-0 text-[11px] font-black uppercase tracking-wide text-white px-4 py-2 rounded-full transition hover:opacity-90 ${active ? 'ring-2 ring-offset-2 ring-slate-300' : ''}`}
                  style={{ backgroundColor: color }}
                >
                  {cat.name_bn || cat.name}
                </button>
              ) : (
                <button
                  type="button"
                  key={cat.id || cat.slug}
                  onClick={() => openCategory(cat.slug)}
                  className={`shrink-0 text-[13px] font-semibold px-3 py-1.5 rounded-full transition ${
                    active ? 'text-[var(--brand)]' : 'text-slate-700 hover:text-[var(--brand)]'
                  }`}
                >
                  {cat.name_bn || cat.name}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setIsTrackingOpen(true)}
              className="shrink-0 text-[13px] font-semibold px-3 py-1.5 text-slate-700 hover:text-[var(--brand)]"
            >
              অর্ডার ট্র্যাক
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="shrink-0 inline-flex items-center gap-1 text-[13px] font-semibold px-3 py-1.5 text-slate-700 hover:text-[var(--brand)]"
              >
                <Settings className="w-3.5 h-3.5" /> অ্যাডমিন
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* ============ মোবাইল ক্যাটাগরি চিপস ============ */}
      <div className="md:hidden bg-white border-b border-slate-100">
        <div className={`flex items-center gap-2 overflow-x-auto px-3 py-2.5 ${NO_SCROLLBAR}`}>
          <button
            type="button"
            onClick={goHome}
            className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border transition"
            style={
              selectedCategory === 'all' && activeTab === 'home'
                ? { backgroundColor: BRAND, color: '#fff', borderColor: BRAND }
                : { backgroundColor: '#fff', color: '#334155', borderColor: '#E2E8F0' }
            }
          >
            হোম
          </button>
          {categories.map((cat, idx) => {
            const active = selectedCategory === cat.slug;
            const isPill = idx >= 5;
            const color = isPill ? PILL_COLORS[(idx - 5) % PILL_COLORS.length] : BRAND;
            const style: React.CSSProperties = isPill
              ? { backgroundColor: color, color: '#fff', borderColor: color, opacity: active ? 1 : 0.92 }
              : active
                ? { backgroundColor: BRAND, color: '#fff', borderColor: BRAND }
                : { backgroundColor: '#fff', color: '#334155', borderColor: '#E2E8F0' };
            return (
              <button
                type="button"
                key={cat.id || cat.slug}
                onClick={() => openCategory(cat.slug)}
                className="shrink-0 px-4 py-1.5 rounded-full text-xs font-bold border whitespace-nowrap transition"
                style={style}
              >
                {cat.name_bn || cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============ MAIN ============ */}
      <main className="flex-1">
        {/* Full-width Hero Slider */}
        {activeTab === 'home' && selectedCategory === 'all' && !searchFilter && banners.length > 0 && (
          <section className="w-full">
            <div className="relative w-full overflow-hidden bg-pink-100 group">
              <button
                type="button"
                onClick={() => handleBannerClick(bannerLink)}
                className="block w-full"
              >
                {bannerImage ? (
                  <img
                    src={bannerImage}
                    alt={currentBanner?.title || 'Banner'}
                    className="w-full h-[200px] sm:h-[320px] lg:h-[460px] object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-[200px] sm:h-[320px] lg:h-[460px] flex items-center justify-center text-white text-3xl sm:text-5xl font-black px-6 text-center"
                    style={{ background: `linear-gradient(120deg, ${BRAND}, #FF8FB5)` }}
                  >
                    {currentBanner?.title || 'বিশেষ অফার'}
                  </div>
                )}
              </button>

              {banners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSlideIndex((i) => (i - 1 + banners.length) % banners.length)}
                    aria-label="Previous slide"
                    className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlideIndex((i) => (i + 1) % banners.length)}
                    aria-label="Next slide"
                    className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white items-center justify-center shadow opacity-0 group-hover:opacity-100 transition"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {banners.length > 1 && (
              <div className="flex items-center justify-center gap-2.5 py-3">
                {banners.map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setSlideIndex(i)}
                    className="w-2.5 h-2.5 rounded-full transition"
                    style={{ backgroundColor: i === slideIndex ? BRAND : '#1f2937' }}
                    aria-label={`slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Feature strip */}
        <section className="max-w-[1100px] mx-auto px-4 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ShieldCheck, title: '১০০% আসল প্রোডাক্ট', sub: 'ব্র্যান্ড অথেনটিক গ্যাজেট', bg: 'bg-pink-50', fg: 'text-pink-600' },
              { icon: Truck, title: 'ক্যাশ অন ডেলিভারি', sub: 'পণ্য দেখে মূল্য পরিশোধ', bg: 'bg-emerald-50', fg: 'text-emerald-600' },
              { icon: RefreshCw, title: '৭ দিনের রিপ্লেসমেন্ট', sub: 'সহজ পরিবর্তন গ্যারান্টি', bg: 'bg-purple-50', fg: 'text-purple-600' },
              { icon: Phone, title: 'হটলাইন সাপোর্ট', sub: `${HOTLINE} (৯am - ১০pm)`, bg: 'bg-amber-50', fg: 'text-amber-600' },
            ].map((f) => (
              <div key={f.title} className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${f.bg} ${f.fg} flex items-center justify-center shrink-0`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{f.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Categories Carousel */}
        {categories.length > 0 && (
          <section className="max-w-[1100px] mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-black uppercase tracking-[0.12em] text-slate-900">
                ক্যাটাগরি সমূহ
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCategories('left')}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-[var(--brand)] flex items-center justify-center transition shadow-sm"
                  aria-label="Previous categories"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-100 text-slate-700 hover:text-[var(--brand)] flex items-center justify-center transition shadow-sm"
                  aria-label="Next categories"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div 
              ref={categoryScrollRef}
              className={`flex items-center gap-4 sm:gap-6 overflow-x-auto scroll-smooth py-2 px-1 ${NO_SCROLLBAR}`}
            >
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onClick={() => openCategory(cat.slug)}
                    className="flex flex-col items-center gap-2 group shrink-0 w-20 sm:w-24 focus:outline-none"
                  >
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center bg-pink-50 border-2 transition group-hover:scale-105 shadow-sm ${
                        isSelected ? 'border-[var(--brand)] ring-2 ring-pink-300' : 'border-pink-100 hover:border-pink-300'
                      }`}
                    >
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <Tag className="w-6 h-6" style={{ color: BRAND }} />
                      )}
                    </div>
                    <p className={`text-xs sm:text-[13px] font-bold text-center leading-tight truncate w-full ${isSelected ? 'text-[var(--brand)]' : 'text-slate-800 group-hover:text-[var(--brand)]'}`}>
                      {cat.name_bn || cat.name}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Flash Sale */}
        {activeTab === 'home' && flashSaleProducts.length > 0 && selectedCategory === 'all' && !searchFilter && (
          <section className="max-w-[1100px] mx-auto px-4 py-6">
            <h2 className="text-center text-sm sm:text-base font-black uppercase tracking-[0.12em] text-slate-900 mb-4">
              ডিলস যা মিস করা যাবে না
            </h2>
            <div
              className="rounded-2xl p-5 sm:p-6 text-white mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-[rgba(253,1,96,0.25)]"
              style={{ background: `linear-gradient(135deg, ${BRAND}, #DC015B)` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0">
                  <Flame className="w-6 h-6 text-brand fill-brand" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-extrabold">ফ্ল্যাশ সেল</h3>
                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      LIMITED TIME
                    </span>
                  </div>
                  <p className="text-white/80 text-xs">জনপ্রিয় গ্যাজেটে বিশেষ ডিসকাউন্ট</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {timeLeft.split(':').map((part, i) => (
                  <React.Fragment key={i}>
                    <div className="bg-white rounded-lg px-2 py-1.5 min-w-[45px] text-center">
                      <span className="block text-brand text-sm font-black tabular-nums leading-none">{part}</span>
                      <span className="block text-brand/70 text-[9px] uppercase font-bold mt-0.5">
                        {i === 0 ? 'Hrs' : i === 1 ? 'Min' : 'Sec'}
                      </span>
                    </div>
                    {i < 2 && <span className="text-white font-black text-xl">:</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {flashSaleProducts.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onOrderNow={(p) => handleOrderNow(p, 1)}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Product Catalog */}
        <section className="max-w-[1100px] mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-ink flex items-center gap-3">
                <span className="w-1 h-6 bg-brand rounded-full" />
                <span>
                  {selectedCategory === 'all'
                    ? 'জনপ্রিয় গ্যাজেটস'
                    : categories.find((c) => c.slug === selectedCategory)?.name_bn || 'ক্যাটাগরি প্রোডাক্টস'}
                </span>
                <span className="text-[10px] font-bold bg-brand text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <Flame className="w-2 h-2" /> HOT
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-brand-border rounded-xl px-4 py-2.5 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 hover:border-brand transition-colors min-h-[40px] appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FD0160'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1rem', paddingRight: '2.5rem' }}
              >
                <option value="default">Sort by: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={(p) => handleAddToCart(p, 1)}
                  onOrderNow={(p) => handleOrderNow(p, 1)}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onToggleWishlist={handleToggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-pink-50/50 rounded-3xl border border-pink-100 p-8 space-y-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-2xl shadow-sm">🔍</div>
              <h3 className="text-base font-bold text-slate-800">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                অন্য কোনো ক্যাটাগরি বা সার্চ কিওয়ার্ড ব্যবহার করে আবার চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSearchFilter(''); }}
                className="text-white font-bold px-6 py-2.5 rounded-full text-xs shadow hover:opacity-90 transition"
                style={{ backgroundColor: BRAND }}
              >
                সব গ্যাজেট দেখুন
              </button>
            </div>
          )}
        </section>



      {/* ================= MODALS & DRAWERS ================= */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <ProductPage
            product={selectedProduct}
            categoryName={categories.find((c) => c.slug === selectedProduct.category || c.id === selectedProduct.category_id)?.name_bn || 'স্মার্ট গ্যাজেটস'}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(p, q, v) => handleAddToCart(p, q, v)}
            onOrderNow={(p, q, v) => handleOrderNow(p, q, v)}
            onToggleWishlist={handleToggleWishlist}
            isWishlisted={wishlist.includes(selectedProduct.id)}
            relatedProducts={relatedProducts}
            onSelectProduct={(p) => setSelectedProduct(p)}
          />
        </div>
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        deliveryZones={deliveryZones}
        selectedZone={selectedZone}
        setSelectedZone={setSelectedZone}
        onProceedToCheckout={handleProceedToCheckout}
        coupons={coupons}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        deliveryZone={selectedZone}
        deliveryZones={deliveryZones}
        setSelectedZone={setSelectedZone}
        discountAmount={checkoutDiscount}
        couponCode={checkoutCouponCode}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderTrackingModal isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />



      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          supabase.auth.getUser().then(({ data }: any) => {
            if (data?.user) setUser(data.user);
          });
        }}
      />
      </main>

      <Footer />
    </div>
  );
}