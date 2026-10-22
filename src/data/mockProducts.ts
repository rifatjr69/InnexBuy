import { Category, Product, Banner, DeliveryZone, Coupon } from '../types';

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-smartwatches',
    name: 'Smartwatches',
    name_bn: 'স্মার্টওয়াচ',
    slug: 'smartwatches',
    icon: 'Watch',
    sub_label: 'AMOLED, Bluetooth Calling',
    sort_order: 1,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-tws-earbuds',
    name: 'TWS Earbuds',
    name_bn: 'ওয়্যারলেস ইয়ারবাড',
    slug: 'tws-earbuds',
    icon: 'Headphones',
    sub_label: 'ANC, Deep Bass, 40h Battery',
    sort_order: 2,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-power-banks',
    name: 'Power Banks',
    name_bn: 'পাওয়ার ব্যাংক',
    slug: 'power-banks',
    icon: 'Battery',
    sub_label: '20W/65W PD Fast Charge',
    sort_order: 3,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1609592426507-4e6c0c2a03f4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-chargers',
    name: 'GaN Chargers',
    name_bn: 'চার্জার ও অ্যাডাপ্টার',
    slug: 'chargers',
    icon: 'Zap',
    sub_label: 'Ultra-Compact Fast Adapters',
    sort_order: 4,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-accessories',
    name: 'Phone Accessories',
    name_bn: 'মোবাইল এক্সেসরিজ',
    slug: 'accessories',
    icon: 'Smartphone',
    sub_label: 'Holders, Cables, Stylus',
    sort_order: 5,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'cat-gaming',
    name: 'Gaming Gadgets',
    name_bn: 'গেমিং গ্যাজেটস',
    slug: 'gaming',
    icon: 'Gamepad2',
    sub_label: 'Phone Cooler, Triggers',
    sort_order: 6,
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80'
  }
];

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'banner-1',
    title: 'ভেরিফাইড স্মার্ট গ্যাজেট মেগা সেল ২০২৬',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&h=720&q=85',
    link_url: '/shop',
    link: '/shop',
    sort_order: 1,
    is_active: true
  },
  {
    id: 'banner-2',
    title: 'প্রিমিয়াম ওয়্যারলেস এএনসি ইয়ারবাড কালেকশন',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1920&h=720&q=85',
    link_url: '/shop?category=tws-earbuds',
    link: '/shop?category=tws-earbuds',
    sort_order: 2,
    is_active: true
  },
  {
    id: 'banner-3',
    title: 'অ্যামোলেড ব্লুটুথ কলিং স্মার্টওয়াচ কালেকশন',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1920&h=720&q=85',
    link_url: '/shop?category=smartwatches',
    link: '/shop?category=smartwatches',
    sort_order: 3,
    is_active: true
  }
];

export const MOCK_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-dhaka',
    name: 'Inside Dhaka City',
    name_bn: 'ঢাকা সিটি কর্পোরেশন এলাকা',
    charge: 60,
    estimated_days: '১-২ কার্যদিবস',
    is_active: true
  },
  {
    id: 'zone-suburb',
    name: 'Dhaka Suburbs',
    name_bn: 'ঢাকা সাবাব ও সাভার/টঙ্গী/কেরানীগঞ্জ',
    charge: 100,
    estimated_days: '২-৩ কার্যদিবস',
    is_active: true
  },
  {
    id: 'zone-outside',
    name: 'Outside Dhaka (Whole Bangladesh)',
    name_bn: 'ঢাকার বাইরে সারা বাংলাদেশ (কুরিয়ার)',
    charge: 130,
    estimated_days: '৩-৫ কার্যদিবস',
    is_active: true
  }
];

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'SAVE100',
    type: 'fixed',
    value: 100,
    min_order: 999
  },
  {
    id: 'coupon-2',
    code: 'INNEX10',
    type: 'percent',
    value: 10,
    min_order: 1499
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-ultra-watch',
    name: 'Innexbuy Ultra 2 AMOLED Bluetooth Calling Smartwatch',
    name_bn: 'ইনেক্সবাই আল্ট্রা ২ অ্যামোলেড ব্লুটুথ কলিং স্মার্টওয়াচ',
    slug: 'innexbuy-ultra-2-amoled-smartwatch',
    category: 'smartwatches',
    category_id: 'cat-smartwatches',
    price: 3250,
    old_price: 4500,
    discount_percent: 28,
    badge: 'HOT DEAL',
    rating: 4.9,
    review_count: 84,
    stock: 45,
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
    ],
    short_description: '2.04" Super AMOLED ডিসপ্লে, ওয়্যারলেস চার্জিং, ব্লুটুথ এইচডি কলিং ও ৭ দিনের দীর্ঘ ব্যাটারি লাইফ।',
    description: `ইনেক্সবাই আল্ট্রা ২ স্মার্টওয়াচে রয়েছে ২.০৪ ইঞ্চি ক্রিস্টাল ক্লিয়ার অ্যামোলেড ডিসপ্লে (AMOLED Display), অলওয়েজ অন ডিসপ্লে (AOD), হার্ট রেট ও স্লিপ মনিটরিং সেন্সর।
    
মেটাল অ্যালয় বডি এবং প্রিমিয়াম সিলিকন বেল্ট সমৃদ্ধ এই ঘড়িতে আছে আইপি৬৮ ওয়াটার রেজিস্ট্যান্ট প্রোটেকশন। সরাসরি কল রিসিভ ও ডায়াল করার সুবিধা রয়েছে।`,
    is_featured: true,
    is_flash_sale: true,
    enable_color: true,
    colors: ['Titanium Silver', 'Midnight Black', 'Ocean Orange']
  },
  {
    id: 'prod-anc-earbuds',
    name: 'Innexbuy Pro Bass ANC Wireless Earbuds (40dB Noise Cancelling)',
    name_bn: 'ইনেক্সবাই প্রো বাস অ্যাক্টিভ নয়েজ ক্যানসেলিং ওয়্যারলেস ইয়ারবাড',
    slug: 'innexbuy-pro-bass-anc-earbuds',
    category: 'tws-earbuds',
    category_id: 'cat-tws-earbuds',
    price: 2150,
    old_price: 2990,
    discount_percent: 28,
    badge: 'BESTSELLER',
    rating: 4.8,
    review_count: 120,
    stock: 60,
    image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80'
    ],
    short_description: '40dB হাইব্রিড অ্যাক্টিভ নয়েজ ক্যান্সেলেশন, কোয়াড মাইক ক্রিস্টাল কলিং এবং ৩৮ ঘণ্টার মোট প্লেটাইম।',
    description: `গেমার ও মিউজিক লাভারদের জন্য পারফেক্ট সাউন্ড ইঞ্জিন। ১৩মিমি ডাইনামিক ড্রাইভারে ক্রিস্টাল ক্লিয়ার ট্রেবল এবং পাঞ্চি সাব-বাস।
    
লো-লেটেন্সি গেমিং মোড (45ms) আপনাকে যেকোনো ব্যাটলগ্রাউন্ড গেমে এগিয়ে রাখবে। টাইপ-সি ফাস্ট চার্জিং সাপোর্টেড।`,
    is_featured: true,
    is_flash_sale: true,
    enable_color: true,
    colors: ['Matte Black', 'Glacier White']
  },
  {
    id: 'prod-powerbank-20k',
    name: 'Innexbuy 20000mAh 65W PD Fast Charging Power Bank',
    name_bn: 'ইনেক্সবাই ২০,০০০ এমএএইচ ৬৫ ওয়াট পিডি ফাস্ট চার্জিং পাওয়ার ব্যাংক',
    slug: 'innexbuy-20000mah-65w-powerbank',
    category: 'power-banks',
    category_id: 'cat-power-banks',
    price: 2850,
    old_price: 3600,
    discount_percent: 21,
    badge: 'PD 65W',
    rating: 4.9,
    review_count: 53,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1609592426507-4e6c0c2a03f4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1609592426507-4e6c0c2a03f4?auto=format&fit=crop&w=800&q=80'
    ],
    short_description: 'ল্যাপটপ, ম্যাকবুক ও স্মার্টফোনের জন্য ৬৫ ওয়াট আল্ট্রা-ফাস্ট চার্জিং পাওয়ার ব্যাংক উইথ ডিজিটাল ডিসপ্লে।',
    description: `ল্যাপটপ বা যেকোনো ফ্ল্যাগশিপ স্মার্টফোন দ্রুততম সময়ে চার্জ করতে ৬৫W পাওয়ার ডেলিভারি সমৃদ্ধ শক্তিশালী ব্যাটারি সেল।
    
এলইডি ডিজিটাল ডিসপ্লেতে রিয়েল-টাইম চার্জ পার্সেন্টেজ দেখা যায়। একসাথে ৩টি ডিভাইসে চার্জ সাপোর্ট করে।`,
    is_featured: true,
    is_flash_sale: false,
    enable_color: true,
    colors: ['Deep Space Gray', 'Classic Black']
  },
  {
    id: 'prod-gan-charger-65w',
    name: 'Innexbuy GaN III 65W 3-Port Fast Wall Charger',
    name_bn: 'ইনেক্সবাই জিএএন ৩ ৬৫ ওয়াট ৩-পোর্ট সুপার ফাস্ট অ্যাডাপ্টার',
    slug: 'innexbuy-gan-65w-charger',
    category: 'chargers',
    category_id: 'cat-chargers',
    price: 1850,
    old_price: 2500,
    discount_percent: 26,
    badge: 'GaN TECH',
    rating: 4.9,
    review_count: 67,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
    ],
    short_description: 'গ্যালিয়াম নাইট্রাইড (GaN) প্রযুক্তিযুক্ত ছোট আকারের ৩-পোর্ট ফাস্ট চার্জার। আইফোন, স্যামসাং ও ল্যাপটপ সাপোর্টেড।',
    description: `অত্যন্ত কম হিটিং এবং সর্বোচ্চ এফিসিয়েন্সি নিশ্চিত করে আধুনিক GaN III চিপসেট। 2x Type-C এবং 1x USB-A আউটপুট।`,
    is_featured: false,
    is_flash_sale: false,
    enable_color: true,
    colors: ['White', 'Black']
  },
  {
    id: 'prod-rgb-cooler',
    name: 'Innexbuy Blizzard RGB Phone Cooler with Digital Temp Display',
    name_bn: 'ইনেক্সবাই ব্লিজার্ড আরজিবি গেমিং ফোন কুলার (সেমিকন্ডাক্টর)',
    slug: 'innexbuy-blizzard-gaming-cooler',
    category: 'gaming',
    category_id: 'cat-gaming',
    price: 1350,
    old_price: 1800,
    discount_percent: 25,
    badge: 'GAMING',
    rating: 4.7,
    review_count: 42,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=800&q=80'
    ],
    short_description: 'সেমিকন্ডাক্টর কুলিং টেকনোলজি মাত্র ৩ সেকেন্ডে ফোনের তাপমাত্রা ঠান্ডা করে ফেলে। পাবজি ও ফ্রিফায়ারে এফপিএস ড্রপ বন্ধ করে।',
    description: `গেমিং এর সময় ডিভাইস অতিরিক্ত গরম হওয়া রোধ করতে আল্ট্রা-সাইলেন্ট ফ্যান ও অ্যালুমিনিয়াম হিটসিংক যুক্ত ফোন কুলার।`,
    is_featured: false,
    is_flash_sale: true,
    enable_color: false
  },
  {
    id: 'prod-mag-stand',
    name: 'Innexbuy 360 Rotating Magnetic Metal Desk Stand',
    name_bn: 'ইনেক্সবাই ৩৬০ ডিগ্রি রোটেটিং ম্যাগনেটিক মেটাল ফোন ও ট্যাব স্ট্যান্ড',
    slug: 'innexbuy-360-magnetic-desk-stand',
    category: 'accessories',
    category_id: 'cat-accessories',
    price: 990,
    old_price: 1450,
    discount_percent: 32,
    badge: 'NEW',
    rating: 4.8,
    review_count: 29,
    stock: 55,
    image_url: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1605792657660-596af9009e82?auto=format&fit=crop&w=800&q=80'
    ],
    short_description: 'ভারী অ্যালুমিনিয়াম বডি, শক্তিশালী ম্যাগনেটিক হোল্ড এবং ৩৬০ ডিগ্রি মসৃণ ঘূর্ণন মেকানিজম।',
    description: `ভিডিও কল, মুভি দেখা বা অফিস ডেস্কে কাজ করার জন্য মজবুত মেটাল স্ট্যান্ড। ফোল্ডেবল ডিজাইন হওয়ায় সহজে বহনযোগ্য।`,
    is_featured: false,
    is_flash_sale: false,
    enable_color: true,
    colors: ['Space Gray', 'Silver']
  }
];
