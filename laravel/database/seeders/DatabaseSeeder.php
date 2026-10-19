<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\Category;
use App\Models\Unit;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Supplier;
use App\Models\Setting;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles
        Role::create([
            'id' => 1,
            'name' => 'ADMIN',
            'display_name_ku' => 'بەڕێوەبەری سەرەکی',
            'display_name_en' => 'Super Administrator',
            'display_name_ar' => 'مدير النظام الرئيسي',
            'description' => 'دەسەڵاتی تەواو بەسەر سەرجەم بەش و داتاکاندا',
        ]);

        Role::create([
            'id' => 2,
            'name' => 'MANAGER',
            'display_name_ku' => 'بەڕێوەبەری لق / کۆگا',
            'display_name_en' => 'Store Manager',
            'display_name_ar' => 'مدير الفرع والمخزن',
            'description' => 'بەڕێوەبردنی کۆگا، کڕین، فرۆشتن و کڕیاران',
        ]);

        Role::create([
            'id' => 3,
            'name' => 'CASHIER',
            'display_name_ku' => 'کاشێر / فرۆشیار',
            'display_name_en' => 'POS Cashier',
            'display_name_ar' => 'محاسب كاشير',
            'description' => 'تەنها دەسەڵاتی تۆمارکردنی فرۆشتن لە کاشێر',
        ]);

        // 2. Seed login users
        $this->call(UserSeeder::class);

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
            Category::create($cat);
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
            Unit::create($u);
        }

        // 5. Seed Products
        $products = [
            [
                'id' => 1, 'barcode' => '628100701001', 'sku' => 'PROD-001',
                'name_ku' => 'شیری تەڕی مەراعی ١ لیتر', 'name_en' => 'Almarai Fresh Milk 1L', 'name_ar' => 'حليب المراعي طازج 1 لتر',
                'category_id' => 1, 'unit_id' => 5, 'purchase_price' => 1250, 'selling_price' => 1750, 'wholesale_price' => 1500,
                'quantity' => 48, 'min_stock' => 10, 'expiry_date' => '2026-11-20', 'description' => 'شیری فرێشی پڕ چەوری'
            ],
            [
                'id' => 2, 'barcode' => '628100701002', 'sku' => 'PROD-002',
                'name_ku' => 'پەنیری شوشەی کڕافت ٥٠٠ گرام', 'name_en' => 'Kraft Cream Cheese 500g', 'name_ar' => 'جبنة كرافت كريمية 500 غرام',
                'category_id' => 1, 'unit_id' => 1, 'purchase_price' => 3500, 'selling_price' => 4750, 'wholesale_price' => 4200,
                'quantity' => 26, 'min_stock' => 8, 'expiry_date' => '2027-02-15', 'description' => 'پەنیری کریستالی کڕافت'
            ],
            [
                'id' => 3, 'barcode' => '628100701003', 'sku' => 'PROD-003',
                'name_ku' => 'ماستی خۆماڵی هەولێر ١ کیلۆ', 'name_en' => 'Local Erbil Yogurt 1kg', 'name_ar' => 'لبن زبادي أربيل 1 كغم',
                'category_id' => 1, 'unit_id' => 2, 'purchase_price' => 1500, 'selling_price' => 2250, 'wholesale_price' => 1900,
                'quantity' => 18, 'min_stock' => 5, 'expiry_date' => '2026-10-15', 'description' => 'ماستی تەواو چەوری کوردی'
            ],
            [
                'id' => 4, 'barcode' => '869050401111', 'sku' => 'PROD-004',
                'name_ku' => 'برنجی کوردی بەسمەتی مەحمود ٥ کیلۆ', 'name_en' => 'Mahmood Basmati Rice 5kg', 'name_ar' => 'أرز محمود بسمتي 5 كغم',
                'category_id' => 2, 'unit_id' => 3, 'purchase_price' => 9500, 'selling_price' => 12500, 'wholesale_price' => 11000,
                'quantity' => 35, 'min_stock' => 8, 'expiry_date' => '2028-06-30', 'description' => 'برنجی نایابی دانە درێژ'
            ],
            [
                'id' => 5, 'barcode' => '869050401112', 'sku' => 'PROD-005',
                'name_ku' => 'چای ئەحمەد کوردی ٤٥٠ گرام', 'name_en' => 'Ahmad Tea Special Blend 450g', 'name_ar' => 'شاي أحمد خلطة خاصة 450 غرام',
                'category_id' => 2, 'unit_id' => 3, 'purchase_price' => 3750, 'selling_price' => 5000, 'wholesale_price' => 4400,
                'quantity' => 60, 'min_stock' => 15, 'expiry_date' => '2027-12-31', 'description' => 'چای کوردی بۆنخۆش و خەست'
            ],
            [
                'id' => 12, 'barcode' => '544900000099', 'sku' => 'PROD-012',
                'name_ku' => 'کۆکاکۆلا قتووی ٣٣٠ مل', 'name_en' => 'Coca-Cola Can 330ml', 'name_ar' => 'كوكا كولا علبة 330 مل',
                'category_id' => 5, 'unit_id' => 1, 'purchase_price' => 400, 'selling_price' => 600, 'wholesale_price' => 480,
                'quantity' => 120, 'min_stock' => 30, 'expiry_date' => '2027-09-01', 'description' => 'خواردنەوەی گازی سارد'
            ],
            [
                'id' => 14, 'barcode' => '869053000001', 'sku' => 'PROD-014',
                'name_ku' => 'مایع زەرفی فەێری لیمۆ ٨٠٠ مل', 'name_en' => 'Fairy Dishwashing Lemon 800ml', 'name_ar' => 'سائل جلي فيري بالليمون 800 مل',
                'category_id' => 6, 'unit_id' => 1, 'purchase_price' => 2200, 'selling_price' => 3000, 'wholesale_price' => 2600,
                'quantity' => 34, 'min_stock' => 8, 'expiry_date' => '2028-01-01', 'description' => 'پاککەرەوەی بەهێزی دەفری چەور'
            ]
        ];

        foreach ($products as $p) {
            Product::create($p);
        }

        // 6. Seed Customers
        Customer::create([
            'id' => 1,
            'name' => 'دانا محەمەد ڕەشید',
            'phone' => '0750 445 1122',
            'address' => 'هەولێر - گەڕەکی بەختیاری',
            'total_purchases' => 158500,
            'total_paid' => 108500,
            'debt' => 50000,
        ]);

        Customer::create([
            'id' => 2,
            'name' => 'شڤان سەردار کەریم',
            'phone' => '0770 112 3344',
            'address' => 'سلێمانی - سەرچنار',
            'total_purchases' => 45000,
            'total_paid' => 45000,
            'debt' => 0,
        ]);

        // 7. Seed Suppliers
        Supplier::create([
            'id' => 1,
            'name' => 'کۆمپانیای بازرگانی زۆزان',
            'company' => 'Zozan Food Trading LLC',
            'phone' => '0750 999 8877',
            'address' => 'هەولێر - ناوچەی پیشەسازی باکوور',
            'total_purchases' => 2400000,
            'total_paid' => 1400000,
            'debt' => 1000000,
        ]);

        // 8. Seed Settings
        $settings = [
            'store_name' => 'فرۆشگای من',
            'store_name_en' => 'My Supermarket',
            'store_name_ar' => 'متجري',
            'store_phone' => '+964 750 123 4567',
            'store_address' => 'هەولێر - شەقامی ٦٠ مەتری - بەرامبەر پارکی نیشتمان',
            'currency' => 'IQD',
            'tax_percentage' => '0',
            'invoice_prefix' => 'INV-',
            'receipt_footer' => 'سوپاس بۆ سەردانەکەتان، کاڵای فرۆشراو تا ٢٤ کاتژمێر دەگۆڕدرێتەوە',
            'default_language' => 'ku',
            'allow_negative_stock' => '0',
            'low_stock_threshold' => '5',
        ];

        foreach ($settings as $k => $v) {
            Setting::set($k, $v);
        }
    }
}
