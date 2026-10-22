import { supabase } from './supabase';
import { MOCK_CATEGORIES, MOCK_PRODUCTS, MOCK_BANNERS, MOCK_DELIVERY_ZONES, MOCK_COUPONS } from '../data/mockProducts';

export async function syncMockDataToSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    // 1. Sync Categories first to get real database UUIDs
    const categoryMap: Record<string, string> = {};

    for (const cat of MOCK_CATEGORIES) {
      // Check if category exists by slug
      const { data: existingCat } = await supabase
        .from('categories')
        .select('id, slug')
        .eq('slug', cat.slug)
        .maybeSingle();

      if (existingCat?.id) {
        categoryMap[cat.slug] = existingCat.id;
      } else {
        const { data: insertedCat, error: catError } = await supabase
          .from('categories')
          .insert({
            name: cat.name,
            name_en: cat.name,
            name_bn: cat.name_bn,
            slug: cat.slug,
            icon: cat.icon || 'Tag',
            sub_label: cat.sub_label,
            image_url: cat.image_url,
            sort_order: cat.sort_order,
            is_active: true
          })
          .select('id, slug')
          .single();

        if (!catError && insertedCat?.id) {
          categoryMap[cat.slug] = insertedCat.id;
        }
      }
    }

    // 2. Sync Products
    let insertedCount = 0;
    for (const prod of MOCK_PRODUCTS) {
      const catId = prod.category ? categoryMap[prod.category] : null;

      // Check if product exists by slug
      const prodSlug = prod.slug || prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const { data: existingProd } = await supabase
        .from('products')
        .select('id')
        .eq('slug', prodSlug)
        .maybeSingle();

      if (!existingProd) {
        const { error: prodError } = await supabase
          .from('products')
          .insert({
            category_id: catId || null,
            name: prod.name,
            name_bn: prod.name_bn || prod.name,
            slug: prodSlug,
            price: prod.price,
            old_price: prod.old_price,
            discount_percent: prod.discount_percent || 0,
            badge: prod.badge,
            rating: prod.rating || 4.8,
            review_count: prod.review_count || 50,
            stock: prod.stock || 50,
            image_url: prod.image_url,
            images: prod.images && prod.images.length > 0 ? prod.images : [prod.image_url],
            short_description: prod.short_description,
            description: prod.description,
            is_featured: !!prod.is_featured,
            is_flash_sale: !!prod.is_flash_sale,
            enable_color: !!prod.enable_color,
            colors: prod.colors || [],
            enable_size: !!prod.enable_size,
            sizes: prod.sizes || []
          });

        if (!prodError) {
          insertedCount++;
        } else {
          console.warn('Product insert error:', prodError.message);
        }
      }
    }

    // 3. Sync Banners if none exist
    const { data: existingBanners } = await supabase.from('banners').select('id').limit(1);
    if (!existingBanners || existingBanners.length === 0) {
      for (const b of MOCK_BANNERS) {
        await supabase.from('banners').insert({
          title: b.title,
          image_url: b.image_url,
          link_url: b.link_url || b.link,
          sort_order: b.sort_order,
          is_active: true
        });
      }
    }

    // 4. Sync Delivery Zones if none exist
    const { data: existingZones } = await supabase.from('delivery_zones').select('id').limit(1);
    if (!existingZones || existingZones.length === 0) {
      for (const z of MOCK_DELIVERY_ZONES) {
        await supabase.from('delivery_zones').insert({
          name: z.name,
          name_bn: z.name_bn,
          charge: z.charge,
          estimated_days: z.estimated_days,
          is_active: true
        });
      }
    }

    // 5. Sync Coupons if none exist
    const { data: existingCoupons } = await supabase.from('coupons').select('id').limit(1);
    if (!existingCoupons || existingCoupons.length === 0) {
      for (const c of MOCK_COUPONS) {
        await supabase.from('coupons').insert({
          code: c.code,
          type: c.type,
          value: c.value,
          min_order: c.min_order
        });
      }
    }

    return { success: true, count: insertedCount };
  } catch (err: any) {
    console.error('Sync to Supabase error:', err);
    return { success: false, count: 0, error: err?.message || 'Sync failed' };
  }
}
