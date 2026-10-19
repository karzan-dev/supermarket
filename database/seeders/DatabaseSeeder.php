<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles
        Role::updateOrCreate(
            ['name' => 'ADMIN'],
            [
                'display_name_ku' => 'بەڕێوەبەری سەرەکی',
                'display_name_en' => 'Super Administrator',
                'display_name_ar' => 'مدير النظام الرئيسي',
                'description' => 'دەسەڵاتی تەواو بەسەر سەرجەم بەش و داتاکاندا',
            ],
        );

        Role::updateOrCreate(
            ['name' => 'MANAGER'],
            [
                'display_name_ku' => 'بەڕێوەبەری لق / کۆگا',
                'display_name_en' => 'Store Manager',
                'display_name_ar' => 'مدير الفرع والمخزن',
                'description' => 'بەڕێوەبردنی کۆگا، کڕین، فرۆشتن و کڕیاران',
            ],
        );

        Role::updateOrCreate(
            ['name' => 'CASHIER'],
            [
                'display_name_ku' => 'کاشێر / فرۆشیار',
                'display_name_en' => 'POS Cashier',
                'display_name_ar' => 'محاسب كاشير',
                'description' => 'تەنها دەسەڵاتی تۆمارکردنی فرۆشتن لە کاشێر',
            ],
        );

        // 2. Seed login users
        $this->call(UserSeeder::class);
        $this->call(RolePermissionSeeder::class);

        // 3. Seed Categories
        $categories = [
            ['id' => 1, 'name_ku' => 'بەرهەمە شیرییەکان', 'name_en' => 'Dairy & Eggs', 'name_ar' => 'الألبان والبيض', 'icon' => 'Milk'],
            ['id' => 2, 'name_ku' => 'خواردن و بەهارات', 'name_en' => 'Pantry & Grains', 'name_ar' => 'المواد التموينية والحبوب', 'icon' => 'Package'],
            ['id' => 3, 'name_ku' => 'سەوزە و میوە', 'name_en' => 'Fresh Produce & Fruits', 'name_ar' => 'الخضروات والفواكه', 'icon' => 'Apple'],
            ['id' => 4, 'name_ku' => 'شیرینی و بسکیت', 'name_en' => 'Snacks & Sweets', 'name_ar' => 'الحلويات والوجبات الخفيفة', 'icon' => 'Cookie'],
            ['id' => 5, 'name_ku' => 'خواردنەوە و شەربەت', 'name_en' => 'Beverages & Juices', 'name_ar' => 'المشروبات والعصائر', 'icon' => 'CupSoda'],
            ['id' => 6, 'name_ku' => 'پاککەرەوە و تەندروستی', 'name_en' => 'Cleaning & Household', 'name_ar' => 'المنظفات والعناية المنزلية', 'icon' => 'Sparkles'],
            ['id' => 7, 'name_ku' => 'نانەواخانە و کێک', 'name_en' => 'Bakery & Bread', 'name_ar' => 'المخبوزات والحلويات', 'icon' => 'Cake'],
        ];
        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(
                ['id' => $cat['id']],
                [...$cat, 'status' => true, 'created_at' => now(), 'updated_at' => now()],
            );
        }

        // 4. Seed Units
        $units = [
            ['id' => 1, 'name_ku' => 'دانە', 'name_en' => 'Piece', 'name_ar' => 'قطعة', 'short_code' => 'pcs'],
            ['id' => 2, 'name_ku' => 'کیلۆگرام', 'name_en' => 'Kilogram', 'name_ar' => 'كيلوغرام', 'short_code' => 'kg'],
            ['id' => 3, 'name_ku' => 'پاکەت', 'name_en' => 'Pack', 'name_ar' => 'علبة / باكت', 'short_code' => 'pack'],
            ['id' => 4, 'name_ku' => 'کارتۆن', 'name_en' => 'Carton', 'name_ar' => 'كرتونة', 'short_code' => 'ctn'],
            ['id' => 5, 'name_ku' => 'لیتر', 'name_en' => 'Liter', 'name_ar' => 'لتر', 'short_code' => 'L'],
        ];
        foreach ($units as $u) {
            DB::table('units')->updateOrInsert(['id' => $u['id']], $u);
        }

        // 5. Seed Products
        $products = [
            [
                'id' => 1, 'barcode' => '628100701001', 'sku' => 'PROD-001',
                'name_ku' => 'شیری تەڕی مەراعی ١ لیتر', 'name_en' => 'Almarai Fresh Milk 1L', 'name_ar' => 'حليب المراعي طازج 1 لتر',
                'category_id' => 1, 'unit_id' => 5, 'purchase_price' => 1250, 'selling_price' => 1750, 'wholesale_price' => 1500,
                'quantity' => 48, 'min_stock' => 10, 'expiry_date' => '2026-11-20', 'description' => 'شیری فرێشی پڕ چەوری',
            ],
            [
                'id' => 2, 'barcode' => '628100701002', 'sku' => 'PROD-002',
                'name_ku' => 'پەنیری شوشەی کڕافت ٥٠٠ گرام', 'name_en' => 'Kraft Cream Cheese 500g', 'name_ar' => 'جبنة كرافت كريمية 500 غرام',
                'category_id' => 1, 'unit_id' => 1, 'purchase_price' => 3500, 'selling_price' => 4750, 'wholesale_price' => 4200,
                'quantity' => 26, 'min_stock' => 8, 'expiry_date' => '2027-02-15', 'description' => 'پەنیری کریستالی کڕافت',
            ],
            [
                'id' => 3, 'barcode' => '628100701003', 'sku' => 'PROD-003',
                'name_ku' => 'ماستی خۆماڵی هەولێر ١ کیلۆ', 'name_en' => 'Local Erbil Yogurt 1kg', 'name_ar' => 'لبن زبادي أربيل 1 كغم',
                'category_id' => 1, 'unit_id' => 2, 'purchase_price' => 1500, 'selling_price' => 2250, 'wholesale_price' => 1900,
                'quantity' => 18, 'min_stock' => 5, 'expiry_date' => '2026-10-15', 'description' => 'ماستی تەواو چەوری کوردی',
            ],
            [
                'id' => 4, 'barcode' => '869050401111', 'sku' => 'PROD-004',
                'name_ku' => 'برنجی کوردی بەسمەتی مەحمود ٥ کیلۆ', 'name_en' => 'Mahmood Basmati Rice 5kg', 'name_ar' => 'أرز محمود بسمتي 5 كغم',
                'category_id' => 2, 'unit_id' => 3, 'purchase_price' => 9500, 'selling_price' => 12500, 'wholesale_price' => 11000,
                'quantity' => 35, 'min_stock' => 8, 'expiry_date' => '2028-06-30', 'description' => 'برنجی نایابی دانە درێژ',
            ],
            [
                'id' => 5, 'barcode' => '869050401112', 'sku' => 'PROD-005',
                'name_ku' => 'چای ئەحمەد کوردی ٤٥٠ گرام', 'name_en' => 'Ahmad Tea Special Blend 450g', 'name_ar' => 'شاي أحمد خلطة خاصة 450 غرام',
                'category_id' => 2, 'unit_id' => 3, 'purchase_price' => 3750, 'selling_price' => 5000, 'wholesale_price' => 4400,
                'quantity' => 60, 'min_stock' => 15, 'expiry_date' => '2027-12-31', 'description' => 'چای کوردی بۆنخۆش و خەست',
            ],
            [
                'id' => 12, 'barcode' => '544900000099', 'sku' => 'PROD-012',
                'name_ku' => 'کۆکاکۆلا قتووی ٣٣٠ مل', 'name_en' => 'Coca-Cola Can 330ml', 'name_ar' => 'كوكا كولا علبة 330 مل',
                'category_id' => 5, 'unit_id' => 1, 'purchase_price' => 400, 'selling_price' => 600, 'wholesale_price' => 480,
                'quantity' => 120, 'min_stock' => 30, 'expiry_date' => '2027-09-01', 'description' => 'خواردنەوەی گازی سارد',
            ],
            [
                'id' => 14, 'barcode' => '869053000001', 'sku' => 'PROD-014',
                'name_ku' => 'مایع زەرفی فەێری لیمۆ ٨٠٠ مل', 'name_en' => 'Fairy Dishwashing Lemon 800ml', 'name_ar' => 'سائل جلي فيري بالليمون 800 مل',
                'category_id' => 6, 'unit_id' => 1, 'purchase_price' => 2200, 'selling_price' => 3000, 'wholesale_price' => 2600,
                'quantity' => 34, 'min_stock' => 8, 'expiry_date' => '2028-01-01', 'description' => 'پاککەرەوەی بەهێزی دەفری چەور',
            ],
            [
                'id' => 6, 'barcode' => '628100701006', 'sku' => 'PROD-006',
                'name_ku' => 'هێلکەی مریشک ٣٠ دانە', 'name_en' => 'Farm Eggs 30 Count', 'name_ar' => 'بيض طازج 30 حبة',
                'category_id' => 1, 'unit_id' => 3, 'purchase_price' => 6500, 'selling_price' => 8000, 'wholesale_price' => 7200,
                'quantity' => 30, 'min_stock' => 6, 'expiry_date' => '2026-11-15', 'description' => 'هێلکەی تازەی ناوخۆیی',
            ],
            [
                'id' => 7, 'barcode' => '628100701007', 'sku' => 'PROD-007',
                'name_ku' => 'مۆز ١ کیلۆ', 'name_en' => 'Fresh Bananas 1kg', 'name_ar' => 'موز طازج 1 كغم',
                'category_id' => 3, 'unit_id' => 2, 'purchase_price' => 1000, 'selling_price' => 1500, 'wholesale_price' => 1250,
                'quantity' => 45, 'min_stock' => 10, 'expiry_date' => '2026-10-20', 'description' => 'مۆزی تازەی هاوردە',
            ],
            [
                'id' => 8, 'barcode' => '628100701008', 'sku' => 'PROD-008',
                'name_ku' => 'ڕۆنی خواردن ١ لیتر', 'name_en' => 'Cooking Oil 1L', 'name_ar' => 'زيت طبخ 1 لتر',
                'category_id' => 2, 'unit_id' => 5, 'purchase_price' => 1750, 'selling_price' => 2500, 'wholesale_price' => 2100,
                'quantity' => 55, 'min_stock' => 12, 'expiry_date' => '2027-08-01', 'description' => 'ڕۆنی پاکی خواردن',
            ],
            [
                'id' => 9, 'barcode' => '628100701009', 'sku' => 'PROD-009',
                'name_ku' => 'ئاردی گەنم ١ کیلۆ', 'name_en' => 'Wheat Flour 1kg', 'name_ar' => 'طحين قمح 1 كغم',
                'category_id' => 2, 'unit_id' => 3, 'purchase_price' => 750, 'selling_price' => 1100, 'wholesale_price' => 900,
                'quantity' => 70, 'min_stock' => 15, 'expiry_date' => '2027-06-01', 'description' => 'ئاردی گەنمی ورد',
            ],
            [
                'id' => 10, 'barcode' => '628100701010', 'sku' => 'PROD-010',
                'name_ku' => 'بیسکیتی چۆکڵێت ٢٠٠ گرام', 'name_en' => 'Chocolate Biscuits 200g', 'name_ar' => 'بسكويت بالشوكولاتة 200 غرام',
                'category_id' => 4, 'unit_id' => 3, 'purchase_price' => 800, 'selling_price' => 1250, 'wholesale_price' => 1000,
                'quantity' => 40, 'min_stock' => 8, 'expiry_date' => '2027-04-01', 'description' => 'بیسکیتی پڕکراو بە چۆکڵێت',
            ],
            [
                'id' => 11, 'barcode' => '628100701011', 'sku' => 'PROD-011',
                'name_ku' => 'ئاوی خواردنەوە ١.٥ لیتر', 'name_en' => 'Drinking Water 1.5L', 'name_ar' => 'مياه شرب 1.5 لتر',
                'category_id' => 5, 'unit_id' => 5, 'purchase_price' => 250, 'selling_price' => 500, 'wholesale_price' => 350,
                'quantity' => 100, 'min_stock' => 20, 'expiry_date' => '2028-06-01', 'description' => 'ئاوی پاک و پاڵاوتراو',
            ],
            [
                'id' => 13, 'barcode' => '628100701013', 'sku' => 'PROD-013',
                'name_ku' => 'شەربەتی پرتەقاڵ ١ لیتر', 'name_en' => 'Orange Juice 1L', 'name_ar' => 'عصير برتقال 1 لتر',
                'category_id' => 5, 'unit_id' => 5, 'purchase_price' => 1250, 'selling_price' => 2000, 'wholesale_price' => 1650,
                'quantity' => 38, 'min_stock' => 8, 'expiry_date' => '2027-03-01', 'description' => 'شەربەتی میوەی پرتەقاڵ',
            ],
            [
                'id' => 15, 'barcode' => '628100701015', 'sku' => 'PROD-015',
                'name_ku' => 'شامپۆی قژ ٤٠٠ مل', 'name_en' => 'Hair Shampoo 400ml', 'name_ar' => 'شامبو للشعر 400 مل',
                'category_id' => 6, 'unit_id' => 1, 'purchase_price' => 2500, 'selling_price' => 3500, 'wholesale_price' => 3000,
                'quantity' => 22, 'min_stock' => 5, 'expiry_date' => '2029-01-01', 'description' => 'شامپۆی پاراستنی قژ',
            ],
            [
                'id' => 16, 'barcode' => '628100701016', 'sku' => 'PROD-016',
                'name_ku' => 'نانی سپی', 'name_en' => 'White Bread Loaf', 'name_ar' => 'خبز أبيض',
                'category_id' => 7, 'unit_id' => 1, 'purchase_price' => 500, 'selling_price' => 750, 'wholesale_price' => 600,
                'quantity' => 25, 'min_stock' => 5, 'expiry_date' => '2026-10-10', 'description' => 'نانی تازەی ڕۆژانە',
            ],
            [
                'id' => 17, 'barcode' => '628100701017', 'sku' => 'PROD-017',
                'name_ku' => 'نۆکی سوور ١ کیلۆ', 'name_en' => 'Red Lentils 1kg', 'name_ar' => 'عدس أحمر 1 كغم',
                'category_id' => 2, 'unit_id' => 2, 'purchase_price' => 1400, 'selling_price' => 2000, 'wholesale_price' => 1700,
                'quantity' => 32, 'min_stock' => 7, 'expiry_date' => '2028-03-01', 'description' => 'نۆکی سووری پاککراو',
            ],
            [
                'id' => 18, 'barcode' => '628100701018', 'sku' => 'PROD-018',
                'name_ku' => 'تەمایتەی تازە ١ کیلۆ', 'name_en' => 'Fresh Tomatoes 1kg', 'name_ar' => 'طماطم طازجة 1 كغم',
                'category_id' => 3, 'unit_id' => 2, 'purchase_price' => 600, 'selling_price' => 1000, 'wholesale_price' => 800,
                'quantity' => 28, 'min_stock' => 6, 'expiry_date' => '2026-10-15', 'description' => 'تەمایتەی تازەی ناوخۆیی',
            ],
            [
                'id' => 19, 'barcode' => '628100701019', 'sku' => 'PROD-019',
                'name_ku' => 'پاککەرەوەی جلی ١ کیلۆ', 'name_en' => 'Laundry Detergent 1kg', 'name_ar' => 'مسحوق غسيل 1 كغم',
                'category_id' => 6, 'unit_id' => 3, 'purchase_price' => 1800, 'selling_price' => 2600, 'wholesale_price' => 2200,
                'quantity' => 24, 'min_stock' => 5, 'expiry_date' => null, 'description' => 'پاککەرەوەی جل بۆ بەکارهێنانی ڕۆژانە',
            ],
            [
                'id' => 20, 'barcode' => '628100701020', 'sku' => 'PROD-020',
                'name_ku' => 'قاوەی چۆکڵێت ١٠٠ گرام', 'name_en' => 'Chocolate Bar 100g', 'name_ar' => 'لوح شوكولاتة 100 غرام',
                'category_id' => 4, 'unit_id' => 1, 'purchase_price' => 900, 'selling_price' => 1400, 'wholesale_price' => 1150,
                'quantity' => 36, 'min_stock' => 8, 'expiry_date' => '2027-12-01', 'description' => 'قاوەی چۆکڵێتی شیری',
            ],
        ];

        foreach ($products as $p) {
            unset($p['name_en'], $p['name_ar']);
            DB::table('products')->updateOrInsert(
                ['id' => $p['id']],
                [...$p, 'status' => 'ACTIVE', 'created_at' => now(), 'updated_at' => now()],
            );
        }

        // 6. Seed Customers
        DB::table('customers')->updateOrInsert(
            ['id' => 1],
            [
                'name' => 'دانا محەمەد ڕەشید',
                'phone' => '0750 445 1122',
                'address' => 'هەولێر - گەڕەکی بەختیاری',
                'total_purchases' => 158500,
                'total_paid' => 108500,
                'debt' => 50000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        DB::table('customers')->updateOrInsert(
            ['id' => 2],
            [
                'name' => 'شڤان سەردار کەریم',
                'phone' => '0770 112 3344',
                'address' => 'سلێمانی - سەرچنار',
                'total_purchases' => 45000,
                'total_paid' => 45000,
                'debt' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        DB::table('customers')->updateOrInsert(
            ['id' => 3],
            [
                'name' => 'Demo Customer',
                'phone' => '0750 000 0003',
                'address' => 'Erbil',
                'total_purchases' => 8500,
                'total_paid' => 8500,
                'debt' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        // 7. Seed Suppliers
        DB::table('suppliers')->updateOrInsert(
            ['id' => 1],
            [
                'name' => 'کۆمپانیای بازرگانی زۆزان',
                'company' => 'Zozan Food Trading LLC',
                'phone' => '0750 999 8877',
                'address' => 'هەولێر - ناوچەی پیشەسازی باکوور',
                'total_purchases' => 2400000,
                'total_paid' => 1400000,
                'debt' => 1000000,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        DB::table('suppliers')->updateOrInsert(
            ['id' => 2],
            [
                'name' => 'Demo Supplier',
                'company' => 'Sample Wholesale Foods',
                'phone' => '0750 000 0002',
                'address' => 'Erbil',
                'total_purchases' => 32500,
                'total_paid' => 32500,
                'debt' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        );

        // 8. Seed Settings
        $settings = [
            'store_name' => 'فرۆشگای من',
            'store_name_en' => 'My Supermarket',
            'store_name_ar' => 'متجري',
            'store_phone' => '+964 750 123 4567',
            'store_address' => 'هەولێر - شەقامی ٦٠ مەتری - بەرامبەر پارکی نیشتمان',
            'currency' => 'IQD',
            'invoice_prefix' => 'INV-',
            'receipt_footer' => 'سوپاس بۆ سەردانەکەتان، کاڵای فرۆشراو تا ٢٤ کاتژمێر دەگۆڕدرێتەوە',
            'default_language' => 'ku',
            'allow_negative_stock' => '0',
            'low_stock_threshold' => '5',
        ];

        foreach ($settings as $k => $v) {
            Setting::set($k, $v);
        }

        $this->seedBusinessTables();
    }

    private function seedBusinessTables(): void
    {
        $userId = User::query()->whereHas('role', fn ($query) => $query->where('name', 'ADMIN'))->value('id');

        $expenseCategories = [
            ['id' => 1, 'name_ku' => 'کارەبا', 'name_en' => 'Electricity', 'name_ar' => 'الكهرباء'],
            ['id' => 2, 'name_ku' => 'کرێی شوێن', 'name_en' => 'Rent', 'name_ar' => 'الإيجار'],
            ['id' => 3, 'name_ku' => 'گواستنەوە', 'name_en' => 'Transport', 'name_ar' => 'النقل'],
        ];

        foreach ($expenseCategories as $category) {
            DB::table('expense_categories')->updateOrInsert(['id' => $category['id']], $category);
        }

        $purchaseDate = now()->subDays(5);
        DB::table('purchases')->updateOrInsert(
            ['invoice_number' => 'DEMO-PUR-0001'],
            [
                'supplier_id' => 2,
                'user_id' => $userId,
                'total' => 32500,
                'paid_amount' => 32500,
                'remaining_amount' => 0,
                'payment_status' => 'PAID',
                'notes' => 'Seeded sample purchase',
                'created_at' => $purchaseDate,
                'updated_at' => $purchaseDate,
            ],
        );
        $purchaseId = DB::table('purchases')->where('invoice_number', 'DEMO-PUR-0001')->value('id');
        DB::table('purchase_items')->updateOrInsert(
            ['purchase_id' => $purchaseId, 'product_id' => 6],
            ['quantity' => 5, 'purchase_price' => 6500, 'total' => 32500],
        );

        $saleDate = now()->subDays(3);
        DB::table('sales')->updateOrInsert(
            ['invoice_number' => 'DEMO-SALE-0001'],
            [
                'user_id' => $userId,
                'customer_id' => 3,
                'subtotal' => 8500,
                'discount' => 0,
                'tax' => 0,
                'total' => 8500,
                'cost_of_goods' => 6250,
                'profit' => 2250,
                'cash_received' => 8500,
                'change_amount' => 0,
                'payment_method' => 'CASH',
                'payment_status' => 'PAID',
                'notes' => 'Seeded sample sale',
                'created_at' => $saleDate,
                'updated_at' => $saleDate,
            ],
        );
        $saleId = DB::table('sales')->where('invoice_number', 'DEMO-SALE-0001')->value('id');

        foreach ([
            ['product_id' => 1, 'quantity' => 2, 'unit_price' => 1750, 'purchase_cost' => 1250, 'total' => 3500, 'profit' => 1000],
            ['product_id' => 5, 'quantity' => 1, 'unit_price' => 5000, 'purchase_cost' => 3750, 'total' => 5000, 'profit' => 1250],
        ] as $item) {
            DB::table('sale_items')->updateOrInsert(
                ['sale_id' => $saleId, 'product_id' => $item['product_id']],
                [...$item, 'discount' => 0],
            );
        }

        DB::table('payments')->updateOrInsert(
            ['payment_type' => 'SALE_PAYMENT', 'reference_id' => $saleId, 'notes' => 'Seeded sample sale payment'],
            [
                'party_type' => 'CUSTOMER',
                'party_id' => 3,
                'amount' => 8500,
                'payment_method' => 'CASH',
                'user_id' => $userId,
                'created_at' => $saleDate,
            ],
        );
        DB::table('payments')->updateOrInsert(
            ['payment_type' => 'SUPPLIER_PAYMENT', 'reference_id' => $purchaseId, 'notes' => 'Seeded sample supplier payment'],
            [
                'party_type' => 'SUPPLIER',
                'party_id' => 2,
                'amount' => 32500,
                'payment_method' => 'CASH',
                'user_id' => $userId,
                'created_at' => $purchaseDate,
            ],
        );

        $returnDate = now()->subDay();
        DB::table('returns')->updateOrInsert(
            ['sale_id' => $saleId, 'reason' => 'Seeded sample return'],
            [
                'invoice_number' => 'DEMO-SALE-0001',
                'customer_id' => 3,
                'user_id' => $userId,
                'total_refund' => 1750,
                'created_at' => $returnDate,
                'updated_at' => $returnDate,
            ],
        );
        $returnId = DB::table('returns')->where('sale_id', $saleId)->where('reason', 'Seeded sample return')->value('id');
        DB::table('return_items')->updateOrInsert(
            ['return_id' => $returnId, 'product_id' => 1],
            ['quantity' => 1, 'unit_price' => 1750, 'total' => 1750],
        );
        DB::table('payments')->updateOrInsert(
            ['payment_type' => 'REFUND', 'reference_id' => $returnId, 'notes' => 'Seeded sample return refund'],
            [
                'party_type' => 'CUSTOMER',
                'party_id' => 3,
                'amount' => 1750,
                'payment_method' => 'CASH',
                'user_id' => $userId,
                'created_at' => $returnDate,
            ],
        );

        DB::table('expenses')->updateOrInsert(
            ['description' => 'Seeded sample electricity expense'],
            [
                'category_id' => 1,
                'amount' => 25000,
                'date' => now()->subDays(2)->toDateString(),
                'user_id' => $userId,
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
        );

        $movements = [
            ['product_id' => 6, 'movement_type' => 'PURCHASE', 'quantity' => 5, 'previous_quantity' => 25, 'new_quantity' => 30, 'reference_type' => 'PURCHASE', 'reference_id' => $purchaseId, 'notes' => 'Seeded sample purchase movement', 'created_at' => $purchaseDate],
            ['product_id' => 1, 'movement_type' => 'SALE', 'quantity' => -2, 'previous_quantity' => 49, 'new_quantity' => 47, 'reference_type' => 'SALE', 'reference_id' => $saleId, 'notes' => 'Seeded sample sale movement', 'created_at' => $saleDate],
            ['product_id' => 5, 'movement_type' => 'SALE', 'quantity' => -1, 'previous_quantity' => 61, 'new_quantity' => 60, 'reference_type' => 'SALE', 'reference_id' => $saleId, 'notes' => 'Seeded sample sale movement', 'created_at' => $saleDate],
            ['product_id' => 1, 'movement_type' => 'RETURN', 'quantity' => 1, 'previous_quantity' => 47, 'new_quantity' => 48, 'reference_type' => 'RETURN', 'reference_id' => $returnId, 'notes' => 'Seeded sample return movement', 'created_at' => $returnDate],
        ];

        foreach ($movements as $movement) {
            DB::table('stock_movements')->updateOrInsert(
                [
                    'product_id' => $movement['product_id'],
                    'movement_type' => $movement['movement_type'],
                    'reference_type' => $movement['reference_type'],
                    'reference_id' => $movement['reference_id'],
                    'notes' => $movement['notes'],
                ],
                [...$movement, 'user_id' => $userId],
            );
        }

        DB::table('activity_logs')->updateOrInsert(
            ['action' => 'SEED', 'entity' => 'DEMO_DATA', 'entity_id' => $saleId],
            [
                'user_id' => $userId,
                'ip_address' => '127.0.0.1',
                'description' => 'Seeded sample supermarket data',
                'created_at' => $saleDate,
            ],
        );
    }
}
