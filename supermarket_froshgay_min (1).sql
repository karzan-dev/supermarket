-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 10, 2026 at 08:56 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `supermarket_froshgay_min`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity` varchar(50) NOT NULL,
  `entity_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(50) DEFAULT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `action`, `entity`, `entity_id`, `ip_address`, `description`, `created_at`) VALUES
(1, 1, 'SEED', 'DEMO_DATA', 1, '127.0.0.1', 'Seeded sample supermarket data', '2026-10-06 19:38:38'),
(2, 1, 'LOGIN', 'USER', 1, '127.0.0.1', 'User admin logged in successfully', '2026-10-09 19:48:31'),
(3, 1, 'UPDATE', 'PRODUCT', 20, '127.0.0.1', 'Updated product قاوەی چۆکڵێت ١٠٠ گرام (628100701020)', '2026-10-09 20:19:32'),
(4, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 1, '127.0.0.1', 'Cash sale INV-20261009-001 (14000.00)', '2026-10-09 20:37:47'),
(5, 1, 'SALE', 'SALE', 32, '127.0.0.1', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261009-001 بە بڕی 14000', '2026-10-09 20:37:47'),
(6, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 2, '127.0.0.1', 'Cash sale INV-20261010-001 (4000.00)', '2026-10-10 14:22:08'),
(7, 1, 'SALE', 'SALE', 33, '127.0.0.1', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261010-001 بە بڕی 4000', '2026-10-10 14:22:08'),
(8, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 3, '127.0.0.1', 'Cash received for credit sale INV-20261010-002 (500.00)', '2026-10-10 14:24:32'),
(9, 1, 'SALE', 'SALE', 34, '127.0.0.1', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261010-002 بە بڕی 2000', '2026-10-10 14:24:32'),
(10, 1, 'CASH_RETURN', 'CASH_REGISTER_TRANSACTION', 4, '127.0.0.1', 'Cash refund for DEMO-SALE-0001 (1750.00)', '2026-10-10 14:32:38'),
(11, 1, 'RETURN', 'SALE', 1, '127.0.0.1', 'گێڕانەوەی کاڵا لە وەسڵی DEMO-SALE-0001 بە کۆی 1750', '2026-10-10 14:32:38'),
(12, 1, 'CASH_RETURN', 'CASH_REGISTER_TRANSACTION', 5, '127.0.0.1', 'Cash refund for DEMO-SALE-0001 (5000.00)', '2026-10-10 14:33:38'),
(13, 1, 'RETURN', 'SALE', 1, '127.0.0.1', 'گێڕانەوەی کاڵا لە وەسڵی DEMO-SALE-0001 بە کۆی 5000', '2026-10-10 14:33:38'),
(14, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 6, '127.0.0.1', 'Cash sale INV-20261010-003 (1400.00)', '2026-10-10 14:42:19'),
(15, 1, 'SALE', 'SALE', 35, '127.0.0.1', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261010-003 بە بڕی 1400', '2026-10-10 14:42:19'),
(16, 1, 'CASH_RETURN', 'CASH_REGISTER_TRANSACTION', 7, '127.0.0.1', 'Cash refund for INV-20261010-003 (1400.00)', '2026-10-10 14:43:05'),
(17, 1, 'RETURN', 'SALE', 35, '127.0.0.1', 'گێڕانەوەی کاڵا لە وەسڵی INV-20261010-003 بە کۆی 1400', '2026-10-10 14:43:05'),
(18, 1, 'PRODUCT_DAMAGE', 'PRODUCT', 20, '127.0.0.1', 'Recorded 1.00 damaged units of قاوەی چۆکڵێت ١٠٠ گرام (EXPIRED)', '2026-10-10 14:53:13'),
(19, 1, 'DELETE', 'PURCHASE', 1, '127.0.0.1', 'سڕینەوەی کڕینی پسوولەی DEMO-PUR-0001', '2026-10-10 14:57:01'),
(20, 1, 'PAYMENT', 'SUPPLIER', 1, '127.0.0.1', 'دانەوەی قەرزی دابینکەر کۆمپانیای بازرگانی زۆزان بە بڕی 1000000', '2026-10-10 15:02:07'),
(21, 1, 'DELETE', 'SUPPLIER', 1, '127.0.0.1', 'Deleted supplier کۆمپانیای بازرگانی زۆزان', '2026-10-10 15:02:10'),
(22, 1, 'DELETE', 'SUPPLIER', 2, '127.0.0.1', 'Deleted supplier Demo Supplier', '2026-10-10 15:02:13'),
(23, 1, 'CREATE', 'SUPPLIER', 3, '127.0.0.1', 'Added supplier لیز', '2026-10-10 15:02:55'),
(24, 1, 'PURCHASE', 'PURCHASE', 3, '127.0.0.1', 'کڕینی کاڵا لە دابینکەر لیز بە کۆی 300000', '2026-10-10 15:36:07');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(191) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('supermarket-froshgay-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:1;', 1791586171),
('supermarket-froshgay-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1791586171;', 1791586171);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(191) NOT NULL,
  `owner` varchar(191) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cash_register_accounts`
--

CREATE TABLE `cash_register_accounts` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `balance` decimal(14,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cash_register_accounts`
--

INSERT INTO `cash_register_accounts` (`id`, `balance`, `created_at`, `updated_at`) VALUES
(1, 11750.00, '2026-10-09 19:38:21', '2026-10-10 14:43:05');

-- --------------------------------------------------------

--
-- Table structure for table `cash_register_shifts`
--

CREATE TABLE `cash_register_shifts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `opened_by` bigint(20) UNSIGNED NOT NULL,
  `closed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `active_slot` tinyint(3) UNSIGNED DEFAULT NULL,
  `opening_balance` decimal(14,2) NOT NULL,
  `expected_balance` decimal(14,2) DEFAULT NULL,
  `counted_balance` decimal(14,2) DEFAULT NULL,
  `variance` decimal(14,2) DEFAULT NULL,
  `opening_notes` text DEFAULT NULL,
  `closing_notes` text DEFAULT NULL,
  `opened_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cash_register_shifts`
--

INSERT INTO `cash_register_shifts` (`id`, `opened_by`, `closed_by`, `active_slot`, `opening_balance`, `expected_balance`, `counted_balance`, `variance`, `opening_notes`, `closing_notes`, `opened_at`, `closed_at`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 1, 0.00, NULL, NULL, NULL, NULL, NULL, '2026-10-09 20:37:47', NULL, '2026-10-09 20:37:47', '2026-10-09 20:37:47');

-- --------------------------------------------------------

--
-- Table structure for table `cash_register_transactions`
--

CREATE TABLE `cash_register_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `transaction_number` varchar(32) DEFAULT NULL,
  `shift_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(32) NOT NULL,
  `direction` enum('IN','OUT') NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `balance_before` decimal(14,2) NOT NULL,
  `balance_after` decimal(14,2) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `source_type` varchar(40) DEFAULT NULL,
  `source_id` bigint(20) UNSIGNED DEFAULT NULL,
  `idempotency_key` varchar(64) DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cash_register_transactions`
--

INSERT INTO `cash_register_transactions` (`id`, `transaction_number`, `shift_id`, `type`, `direction`, `amount`, `balance_before`, `balance_after`, `reason`, `notes`, `source_type`, `source_id`, `idempotency_key`, `user_id`, `created_at`) VALUES
(1, 'CSH-20261009-00000001', 1, 'SALE', 'IN', 14000.00, 0.00, 14000.00, 'Cash sale INV-20261009-001', NULL, 'SALE', 32, 'f831620f-6074-4229-95e6-3abfd31b042e', 1, '2026-10-09 23:37:47'),
(2, 'CSH-20261010-00000002', 1, 'SALE', 'IN', 4000.00, 14000.00, 18000.00, 'Cash sale INV-20261010-001', NULL, 'SALE', 33, '9b6f0103-1904-4089-a52b-f21bd6e529b3', 1, '2026-10-10 17:22:08'),
(3, 'CSH-20261010-00000003', 1, 'CUSTOMER_PAYMENT', 'IN', 500.00, 18000.00, 18500.00, 'Cash received for credit sale INV-20261010-002', NULL, 'PAYMENT', 36, NULL, 1, '2026-10-10 17:24:32'),
(4, 'CSH-20261010-00000004', 1, 'RETURN', 'OUT', 1750.00, 18500.00, 16750.00, 'Cash refund for DEMO-SALE-0001', 'تێکچوە', 'RETURN', 2, NULL, 1, '2026-10-10 17:32:38'),
(5, 'CSH-20261010-00000005', 1, 'RETURN', 'OUT', 5000.00, 16750.00, 11750.00, 'Cash refund for DEMO-SALE-0001', NULL, 'RETURN', 3, NULL, 1, '2026-10-10 17:33:38'),
(6, 'CSH-20261010-00000006', 1, 'SALE', 'IN', 1400.00, 11750.00, 13150.00, 'Cash sale INV-20261010-003', NULL, 'SALE', 35, 'd5f1c771-18fa-4b81-ac9c-84e4b3b65f35', 1, '2026-10-10 17:42:19'),
(7, 'CSH-20261010-00000007', 1, 'RETURN', 'OUT', 1400.00, 13150.00, 11750.00, 'Cash refund for INV-20261010-003', 'ssss', 'RETURN', 4, NULL, 1, '2026-10-10 17:43:05');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name_ku` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL DEFAULT 'Layers',
  `status` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name_ku`, `name_en`, `name_ar`, `icon`, `status`, `created_at`, `updated_at`) VALUES
(1, 'بەرهەمە شیرییەکان', 'Dairy & Eggs', 'الألبان والبيض', 'Milk', 1, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(2, 'خواردن و بەهارات', 'Pantry & Grains', 'المواد التموينية والحبوب', 'Package', 1, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(3, 'سەوزە و میوە', 'Fresh Produce & Fruits', 'الخضروات والفواكه', 'Apple', 1, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(4, 'شیرینی و بسکیت', 'Snacks & Sweets', 'الحلويات والوجبات الخفيفة', 'Cookie', 1, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(5, 'خواردنەوە و شەربەت', 'Beverages & Juices', 'المشروبات والعصائر', 'CupSoda', 1, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(6, 'پاککەرەوە و تەندروستی', 'Cleaning & Household', 'المنظفات والعناية المنزلية', 'Sparkles', 1, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(7, 'نانەواخانە و کێک', 'Bakery & Bread', 'المخبوزات والحلويات', 'Cake', 1, '2026-10-09 19:38:38', '2026-10-09 19:38:38');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_purchases` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_paid` decimal(14,2) NOT NULL DEFAULT 0.00,
  `debt` decimal(14,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `phone`, `address`, `notes`, `total_purchases`, `total_paid`, `debt`, `created_at`, `updated_at`) VALUES
(1, 'دانا محەمەد ڕەشید', '0750 445 1122', 'هەولێر - گەڕەکی بەختیاری', NULL, 158500.00, 108500.00, 50000.00, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(2, 'شڤان سەردار کەریم', '0770 112 3344', 'سلێمانی - سەرچنار', NULL, 45000.00, 45000.00, 0.00, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(3, 'Demo Customer', '0750 000 0003', 'Erbil', NULL, 8500.00, 8500.00, 0.00, '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(4, 'karzan', '07721091372', 'kalar', NULL, 2000.00, 500.00, 1500.00, '2026-10-10 14:24:32', '2026-10-10 14:24:32');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `date` date NOT NULL,
  `description` text DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `idempotency_key` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `category_id`, `amount`, `date`, `description`, `user_id`, `created_at`, `updated_at`, `idempotency_key`) VALUES
(1, 1, 25000.00, '2026-10-07', 'Seeded sample electricity expense', 1, '2026-10-07 19:38:38', '2026-10-07 19:38:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name_ku` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `name_ar` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `name_ku`, `name_en`, `name_ar`) VALUES
(1, 'کارەبا', 'Electricity', 'الكهرباء'),
(2, 'کرێی شوێن', 'Rent', 'الإيجار'),
(3, 'گواستنەوە', 'Transport', 'النقل');

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(191) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_01_01_000001_create_roles_and_permissions_tables', 1),
(2, '2026_01_01_000002_create_users_table', 1),
(3, '2026_01_01_000003_create_categories_and_units_tables', 1),
(4, '2026_01_01_000004_create_products_table', 1),
(5, '2026_01_01_000005_create_customers_and_suppliers_tables', 1),
(6, '2026_01_01_000006_create_sales_and_sale_items_tables', 1),
(7, '2026_01_01_000007_create_purchases_and_purchase_items_tables', 1),
(8, '2026_01_01_000008_create_payments_table', 1),
(9, '2026_01_01_000009_create_expenses_tables', 1),
(10, '2026_01_01_000010_create_stock_movements_table', 1),
(11, '2026_01_01_000011_create_returns_and_return_items_tables', 1),
(12, '2026_01_01_000012_create_settings_and_activity_logs_tables', 1),
(13, '2026_10_07_000001_remove_translated_product_names', 1),
(14, '2026_10_07_000002_normalize_product_skus', 1),
(15, '2026_10_07_000003_add_receipt_image_to_purchases', 1),
(16, '2026_10_07_000004_add_previous_purchase_price_to_purchase_items', 1),
(17, '2026_10_07_115948_create_sessions_table', 1),
(18, '2026_10_07_124900_create_personal_access_tokens_table', 1),
(19, '2026_10_08_000001_seed_staff_permissions', 1),
(20, '2026_10_08_000002_create_cache_tables', 1),
(21, '2026_10_08_000003_add_damage_reason_to_stock_movements', 1),
(22, '2026_10_09_000001_create_cash_register_tables', 1),
(23, '2026_10_09_000002_add_cash_register_permissions', 1),
(24, '2026_10_09_235500_add_custom_user_permissions', 1);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `payment_type` varchar(50) NOT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `party_type` varchar(50) DEFAULT NULL,
  `party_id` bigint(20) UNSIGNED DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `payment_method` varchar(50) NOT NULL DEFAULT 'CASH',
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `idempotency_key` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `payment_type`, `reference_id`, `party_type`, `party_id`, `amount`, `payment_method`, `user_id`, `notes`, `created_at`, `idempotency_key`) VALUES
(1, 'SALE_PAYMENT', 1, 'CUSTOMER', 3, 8500.00, 'CASH', 1, 'Seeded sample sale payment', '2026-10-06 19:38:38', NULL),
(3, 'REFUND', 1, 'CUSTOMER', 3, 1750.00, 'CASH', 1, 'Seeded sample return refund', '2026-10-08 19:38:38', NULL),
(34, 'SALE_PAYMENT', 32, 'CUSTOMER', NULL, 14000.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261009-001', '2026-10-09 20:37:47', NULL),
(35, 'SALE_PAYMENT', 33, 'CUSTOMER', NULL, 4000.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261010-001', '2026-10-10 14:22:08', NULL),
(36, 'SALE_PAYMENT', 34, 'CUSTOMER', 4, 500.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261010-002', '2026-10-10 14:24:32', NULL),
(37, 'REFUND', 2, 'CUSTOMER', 3, 1750.00, 'CASH', 1, 'گەڕاندنەوەی پارە بۆ وەسڵی DEMO-SALE-0001', '2026-10-10 14:32:38', NULL),
(38, 'REFUND', 3, 'CUSTOMER', 3, 5000.00, 'CASH', 1, 'گەڕاندنەوەی پارە بۆ وەسڵی DEMO-SALE-0001', '2026-10-10 14:33:38', NULL),
(39, 'SALE_PAYMENT', 35, 'CUSTOMER', NULL, 1400.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261010-003', '2026-10-10 14:42:19', NULL),
(40, 'REFUND', 4, NULL, NULL, 1400.00, 'CASH', 1, 'گەڕاندنەوەی پارە بۆ وەسڵی INV-20261010-003', '2026-10-10 14:43:05', NULL),
(52, 'SUPPLIER_DEBT_PAYMENT', 1, 'SUPPLIER', 1, 1000000.00, 'BANK', 1, 'دانەوەی قەرزی دابینکەر', '2026-10-10 15:02:07', 'cff744d9-1a25-43c5-9c13-fdcaea6b48c6'),
(54, 'SUPPLIER_PAYMENT', 3, 'SUPPLIER', 3, 150000.00, 'CASH', 1, 'پارەدان بۆ کڕینی پسوولەی PUR-1791655415773', '2026-10-10 15:36:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `module` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `module`, `description`) VALUES
(1, 'dashboard.view', 'dashboard', 'View dashboard and business statistics'),
(2, 'pos.use', 'pos', 'Process point-of-sale transactions'),
(3, 'products.view', 'products', 'View products and barcode details'),
(4, 'products.manage', 'products', 'Create, edit and archive products'),
(5, 'categories.view', 'categories', 'View categories'),
(6, 'categories.manage', 'categories', 'Manage categories'),
(7, 'units.view', 'units', 'View units'),
(8, 'units.manage', 'units', 'Manage units'),
(9, 'inventory.view', 'inventory', 'View inventory and stock movements'),
(10, 'inventory.manage', 'inventory', 'Adjust inventory and record damage'),
(11, 'damage.view', 'damaged-products', 'View damaged product records'),
(12, 'purchases.view', 'purchases', 'View purchases'),
(13, 'purchases.manage', 'purchases', 'Manage purchases'),
(14, 'returns.view', 'returns', 'View and search sales for returns'),
(15, 'returns.manage', 'returns', 'Process returns and refunds'),
(16, 'customers.view', 'customers', 'View customers'),
(17, 'customers.manage', 'customers', 'Manage customers and debt payments'),
(18, 'suppliers.view', 'suppliers', 'View suppliers'),
(19, 'suppliers.manage', 'suppliers', 'Manage suppliers and payments'),
(20, 'expenses.view', 'expenses', 'View expenses and expense categories'),
(21, 'expenses.manage', 'expenses', 'Manage expenses'),
(22, 'cash.view', 'cash-register', 'View the cash-register balance and transaction history'),
(23, 'cash.manage', 'cash-register', 'Manage cash movements and cashier shifts'),
(24, 'reports.view', 'reports', 'View business reports'),
(25, 'users.manage', 'users', 'Manage staff accounts'),
(26, 'settings.view', 'settings', 'Read store configuration required by the application'),
(27, 'settings.manage', 'settings', 'Manage system settings'),
(28, 'activity_logs.view', 'activity-logs', 'View system activity logs');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(191) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', 'a906d64726a8ca1121ee5fe71641fdda53262d370e70ab0dbb6bfa88b13416ba', '[\"*\"]', '2026-10-10 15:56:40', NULL, '2026-10-09 19:48:31', '2026-10-10 15:56:40');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `barcode` varchar(100) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `name_ku` varchar(150) NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `unit_id` bigint(20) UNSIGNED NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `wholesale_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `min_stock` decimal(12,2) NOT NULL DEFAULT 5.00,
  `expiry_date` date DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `barcode`, `sku`, `name_ku`, `category_id`, `unit_id`, `purchase_price`, `selling_price`, `wholesale_price`, `quantity`, `min_stock`, `expiry_date`, `image`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, '628100701001', 'PROD-001', 'شیری تەڕی مەراعی ١ لیتر', 1, 5, 1250.00, 1750.00, 1500.00, 49.00, 10.00, '2026-11-20', NULL, 'شیری فرێشی پڕ چەوری', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-10 14:32:38'),
(2, '628100701002', 'PROD-002', 'پەنیری شوشەی کڕافت ٥٠٠ گرام', 1, 1, 3500.00, 4750.00, 4200.00, 26.00, 8.00, '2027-02-15', NULL, 'پەنیری کریستالی کڕافت', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(3, '628100701003', 'PROD-003', 'ماستی خۆماڵی هەولێر ١ کیلۆ', 1, 2, 1500.00, 2250.00, 1900.00, 18.00, 5.00, '2026-10-15', NULL, 'ماستی تەواو چەوری کوردی', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(4, '869050401111', 'PROD-004', 'برنجی کوردی بەسمەتی مەحمود ٥ کیلۆ', 2, 3, 9500.00, 12500.00, 11000.00, 35.00, 8.00, '2028-06-30', NULL, 'برنجی نایابی دانە درێژ', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(5, '869050401112', 'PROD-005', 'چای ئەحمەد کوردی ٤٥٠ گرام', 2, 3, 3750.00, 5000.00, 4400.00, 61.00, 15.00, '2027-12-31', NULL, 'چای کوردی بۆنخۆش و خەست', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-10 14:33:38'),
(6, '628100701006', 'PROD-006', 'هێلکەی مریشک ٣٠ دانە', 1, 3, 6500.00, 8000.00, 7200.00, 25.00, 6.00, '2026-11-15', NULL, 'هێلکەی تازەی ناوخۆیی', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-10 14:57:01'),
(7, '628100701007', 'PROD-007', 'مۆز ١ کیلۆ', 3, 2, 1000.00, 1500.00, 1250.00, 45.00, 10.00, '2026-10-20', NULL, 'مۆزی تازەی هاوردە', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(8, '628100701008', 'PROD-008', 'ڕۆنی خواردن ١ لیتر', 2, 5, 1750.00, 2500.00, 2100.00, 55.00, 12.00, '2027-08-01', NULL, 'ڕۆنی پاکی خواردن', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(9, '628100701009', 'PROD-009', 'ئاردی گەنم ١ کیلۆ', 2, 3, 750.00, 1100.00, 900.00, 70.00, 15.00, '2027-06-01', NULL, 'ئاردی گەنمی ورد', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(10, '628100701010', 'PROD-010', 'بیسکیتی چۆکڵێت ٢٠٠ گرام', 4, 3, 800.00, 1250.00, 1000.00, 40.00, 8.00, '2027-04-01', NULL, 'بیسکیتی پڕکراو بە چۆکڵێت', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(11, '628100701011', 'PROD-011', 'ئاوی خواردنەوە ١.٥ لیتر', 5, 5, 250.00, 500.00, 350.00, 100.00, 20.00, '2028-06-01', NULL, 'ئاوی پاک و پاڵاوتراو', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(12, '544900000099', 'PROD-012', 'کۆکاکۆلا قتووی ٣٣٠ مل', 5, 1, 1000.00, 600.00, 480.00, 420.00, 30.00, '2027-09-01', NULL, 'خواردنەوەی گازی سارد', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-10 15:36:07'),
(13, '628100701013', 'PROD-013', 'شەربەتی پرتەقاڵ ١ لیتر', 5, 5, 1250.00, 2000.00, 1650.00, 38.00, 8.00, '2027-03-01', NULL, 'شەربەتی میوەی پرتەقاڵ', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(14, '869053000001', 'PROD-014', 'مایع زەرفی فەێری لیمۆ ٨٠٠ مل', 6, 1, 2200.00, 3000.00, 2600.00, 34.00, 8.00, '2028-01-01', NULL, 'پاککەرەوەی بەهێزی دەفری چەور', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(15, '628100701015', 'PROD-015', 'شامپۆی قژ ٤٠٠ مل', 6, 1, 2500.00, 3500.00, 3000.00, 22.00, 5.00, '2029-01-01', NULL, 'شامپۆی پاراستنی قژ', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(16, '628100701016', 'PROD-016', 'نانی سپی', 7, 1, 500.00, 750.00, 600.00, 25.00, 5.00, '2026-10-10', NULL, 'نانی تازەی ڕۆژانە', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(17, '628100701017', 'PROD-017', 'نۆکی سوور ١ کیلۆ', 2, 2, 1400.00, 2000.00, 1700.00, 31.00, 7.00, '2028-03-01', NULL, 'نۆکی سووری پاککراو', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 20:37:47'),
(18, '628100701018', 'PROD-018', 'تەمایتەی تازە ١ کیلۆ', 3, 2, 600.00, 1000.00, 800.00, 26.00, 6.00, '2026-10-15', NULL, 'تەمایتەی تازەی ناوخۆیی', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-10 14:22:08'),
(19, '628100701019', 'PROD-019', 'پاککەرەوەی جلی ١ کیلۆ', 6, 3, 1800.00, 2600.00, 2200.00, 22.00, 5.00, NULL, NULL, 'پاککەرەوەی جل بۆ بەکارهێنانی ڕۆژانە', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-10 14:22:08'),
(20, '628100701020', 'PROD-020', 'قاوەی چۆکڵێت ١٠٠ گرام', 4, 1, 900.00, 1400.00, 1150.00, 26.00, 8.00, '2027-12-01', 'products/ymNL1eoDNKPl3wmG5E0NWoarQxHEuj8JOubHYXQd.jpg', 'قاوەی چۆکڵێتی شیری', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-10 14:53:13');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `receipt_image` varchar(191) DEFAULT NULL,
  `supplier_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `total` decimal(14,2) NOT NULL,
  `paid_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `remaining_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('PAID','PARTIAL','DUE') NOT NULL DEFAULT 'PAID',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `invoice_number`, `receipt_image`, `supplier_id`, `user_id`, `total`, `paid_amount`, `remaining_amount`, `payment_status`, `notes`, `created_at`, `updated_at`) VALUES
(3, 'PUR-1791655415773', NULL, 3, 1, 300000.00, 150000.00, 150000.00, 'PARTIAL', 'u', '2026-10-10 15:36:07', '2026-10-10 15:36:07');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `purchase_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL,
  `previous_purchase_price` decimal(12,2) DEFAULT NULL,
  `total` decimal(14,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`id`, `purchase_id`, `product_id`, `quantity`, `purchase_price`, `previous_purchase_price`, `total`) VALUES
(3, 3, 12, 300.00, 1000.00, 400.00, 300000.00);

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

CREATE TABLE `returns` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `total_refund` decimal(14,2) NOT NULL,
  `reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `idempotency_key` varchar(64) DEFAULT NULL,
  `request_hash` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `returns`
--

INSERT INTO `returns` (`id`, `sale_id`, `invoice_number`, `customer_id`, `user_id`, `total_refund`, `reason`, `created_at`, `updated_at`, `idempotency_key`, `request_hash`) VALUES
(1, 1, 'DEMO-SALE-0001', 3, 1, 1750.00, 'Seeded sample return', '2026-10-08 19:38:38', '2026-10-08 19:38:38', NULL, NULL),
(2, 1, 'DEMO-SALE-0001', 3, 1, 1750.00, 'تێکچوە', '2026-10-10 14:32:38', '2026-10-10 14:32:38', '4880300c-8bdc-435f-bea5-59ede1835cc4', 'e719e00c73e89739adea2c607339d9e2a3751bce1c5ff625716becb585704aaf'),
(3, 1, 'DEMO-SALE-0001', 3, 1, 5000.00, 'گێڕانەوەی کاڵا', '2026-10-10 14:33:38', '2026-10-10 14:33:38', '53bb5033-36b9-4cc0-9b60-7696456b14fc', 'd202b054b4d937529bce4f9ea043c64b1de0544fc7d238eec81e537d849cea1d'),
(4, 35, 'INV-20261010-003', NULL, 1, 1400.00, 'ssss', '2026-10-10 14:43:05', '2026-10-10 14:43:05', '81101e5b-1257-4330-a718-c562c06a28bb', '7e63d2605d8b0d8368421bbac76adcaf5b037bb8fc57e5fcbe9bb4bf6b682c4a');

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

CREATE TABLE `return_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `return_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total` decimal(14,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `return_items`
--

INSERT INTO `return_items` (`id`, `return_id`, `product_id`, `quantity`, `unit_price`, `total`) VALUES
(1, 1, 1, 1.00, 1750.00, 1750.00),
(2, 2, 1, 1.00, 1750.00, 1750.00),
(3, 3, 5, 1.00, 5000.00, 5000.00),
(4, 4, 20, 1.00, 1400.00, 1400.00);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `display_name_ku` varchar(100) NOT NULL,
  `display_name_en` varchar(100) NOT NULL,
  `display_name_ar` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `display_name_ku`, `display_name_en`, `display_name_ar`, `description`, `created_at`) VALUES
(1, 'ADMIN', 'بەڕێوەبەری سەرەکی', 'Super Administrator', 'مدير النظام الرئيسي', 'دەسەڵاتی تەواو بەسەر سەرجەم بەش و داتاکاندا', '2026-10-09 22:38:22'),
(2, 'MANAGER', 'بەڕێوەبەری لق / کۆگا', 'Store Manager', 'مدير الفرع والمخزن', 'بەڕێوەبردنی کۆگا، کڕین، فرۆشتن و کڕیاران', '2026-10-09 22:38:22'),
(3, 'CASHIER', 'کاشێر / فرۆشیار', 'POS Cashier', 'محاسب كاشير', 'تەنها دەسەڵاتی تۆمارکردنی فرۆشتن لە کاشێر', '2026-10-09 22:38:22');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(1, 2),
(1, 3),
(1, 4),
(1, 5),
(1, 6),
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11),
(1, 12),
(1, 13),
(1, 14),
(1, 15),
(1, 16),
(1, 17),
(1, 18),
(1, 19),
(1, 20),
(1, 21),
(1, 22),
(1, 23),
(1, 24),
(1, 25),
(1, 26),
(1, 27),
(1, 28),
(2, 1),
(2, 2),
(2, 3),
(2, 4),
(2, 5),
(2, 6),
(2, 7),
(2, 8),
(2, 9),
(2, 10),
(2, 11),
(2, 12),
(2, 13),
(2, 14),
(2, 15),
(2, 16),
(2, 17),
(2, 18),
(2, 19),
(2, 20),
(2, 21),
(2, 22),
(2, 23),
(2, 24),
(2, 26),
(3, 2),
(3, 3),
(3, 5),
(3, 7),
(3, 16),
(3, 22),
(3, 23),
(3, 26);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `customer_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subtotal` decimal(14,2) NOT NULL,
  `discount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total` decimal(14,2) NOT NULL,
  `cost_of_goods` decimal(14,2) NOT NULL DEFAULT 0.00,
  `profit` decimal(14,2) NOT NULL DEFAULT 0.00,
  `cash_received` decimal(14,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `payment_method` enum('CASH','CARD','CREDIT') NOT NULL DEFAULT 'CASH',
  `payment_status` enum('PAID','PARTIAL','DUE') NOT NULL DEFAULT 'PAID',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `idempotency_key` varchar(64) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `invoice_number`, `user_id`, `customer_id`, `subtotal`, `discount`, `tax`, `total`, `cost_of_goods`, `profit`, `cash_received`, `change_amount`, `payment_method`, `payment_status`, `notes`, `created_at`, `updated_at`, `idempotency_key`) VALUES
(1, 'DEMO-SALE-0001', 1, 3, 8500.00, 0.00, 0.00, 8500.00, 6250.00, 2250.00, 8500.00, 0.00, 'CASH', 'PAID', 'Seeded sample sale', '2026-10-06 19:38:38', '2026-10-06 19:38:38', NULL),
(32, 'INV-20261009-001', 1, NULL, 14000.00, 0.00, 0.00, 14000.00, 9200.00, 4800.00, 14000.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-09 20:37:47', '2026-10-09 20:37:47', 'f831620f-6074-4229-95e6-3abfd31b042e'),
(33, 'INV-20261010-001', 1, NULL, 5000.00, 1000.00, 0.00, 4000.00, 3300.00, 700.00, 4000.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-10 14:22:08', '2026-10-10 14:22:08', '9b6f0103-1904-4089-a52b-f21bd6e529b3'),
(34, 'INV-20261010-002', 1, 4, 2800.00, 800.00, 0.00, 2000.00, 1800.00, 200.00, 500.00, 0.00, 'CREDIT', 'PARTIAL', NULL, '2026-10-10 14:24:32', '2026-10-10 14:24:32', '43f8a059-6497-4923-b704-57fda037db2f'),
(35, 'INV-20261010-003', 1, NULL, 1400.00, 0.00, 0.00, 1400.00, 900.00, 500.00, 1400.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-10 14:42:19', '2026-10-10 14:42:19', 'd5f1c771-18fa-4b81-ac9c-84e4b3b65f35');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sale_id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `purchase_cost` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total` decimal(14,2) NOT NULL,
  `profit` decimal(14,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `quantity`, `unit_price`, `purchase_cost`, `discount`, `total`, `profit`) VALUES
(1, 1, 1, 2.00, 1750.00, 1250.00, 0.00, 3500.00, 1000.00),
(2, 1, 5, 1.00, 5000.00, 3750.00, 0.00, 5000.00, 1250.00),
(123, 32, 20, 6.00, 1400.00, 900.00, 0.00, 8400.00, 3000.00),
(124, 32, 19, 1.00, 2600.00, 1800.00, 0.00, 2600.00, 800.00),
(125, 32, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(126, 32, 17, 1.00, 2000.00, 1400.00, 0.00, 2000.00, 600.00),
(127, 33, 20, 1.00, 1400.00, 900.00, 0.00, 1400.00, 500.00),
(128, 33, 19, 1.00, 2600.00, 1800.00, 0.00, 2600.00, 800.00),
(129, 33, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(130, 34, 20, 2.00, 1400.00, 900.00, 0.00, 2800.00, 1000.00),
(131, 35, 20, 1.00, 1400.00, 900.00, 0.00, 1400.00, 500.00);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('6XsP8AK528A98IjaJY6gpVSONITWiZf2clknqHCK', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ253aFh0Y2hnNUt4UDc2R2Y3Ynl2MUpCcHpjRGFkNTJFclJEa1ZqeCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791658598);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key_name` varchar(100) NOT NULL,
  `key_value` text DEFAULT NULL,
  `group_name` varchar(50) NOT NULL DEFAULT 'general'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key_name`, `key_value`, `group_name`) VALUES
(1, 'store_name', 'فرۆشگای من', 'general'),
(2, 'store_name_en', 'My Supermarket', 'general'),
(3, 'store_name_ar', 'متجري', 'general'),
(4, 'store_phone', '+964 750 123 4567', 'general'),
(5, 'store_address', 'هەولێر - شەقامی ٦٠ مەتری - بەرامبەر پارکی نیشتمان', 'general'),
(6, 'currency', 'IQD', 'general'),
(7, 'tax_percentage', '0', 'general'),
(8, 'invoice_prefix', 'INV-', 'general'),
(9, 'receipt_footer', 'سوپاس بۆ سەردانەکەتان، کاڵای فرۆشراو تا ٢٤ کاتژمێر دەگۆڕدرێتەوە', 'general'),
(10, 'default_language', 'ku', 'general'),
(11, 'allow_negative_stock', '0', 'general'),
(12, 'low_stock_threshold', '5', 'general');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `movement_type` varchar(50) NOT NULL,
  `damage_reason` varchar(30) DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `previous_quantity` decimal(12,2) NOT NULL,
  `new_quantity` decimal(12,2) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `damage_reason`, `quantity`, `previous_quantity`, `new_quantity`, `reference_type`, `reference_id`, `user_id`, `notes`, `created_at`) VALUES
(1, 6, 'PURCHASE', NULL, 5.00, 25.00, 30.00, 'PURCHASE', 1, 1, 'Seeded sample purchase movement', '2026-10-04 19:38:38'),
(2, 1, 'SALE', NULL, -2.00, 49.00, 47.00, 'SALE', 1, 1, 'Seeded sample sale movement', '2026-10-06 19:38:38'),
(3, 5, 'SALE', NULL, -1.00, 61.00, 60.00, 'SALE', 1, 1, 'Seeded sample sale movement', '2026-10-06 19:38:38'),
(4, 1, 'RETURN', NULL, 1.00, 47.00, 48.00, 'RETURN', 1, 1, 'Seeded sample return movement', '2026-10-08 19:38:38'),
(125, 20, 'SALE', NULL, 6.00, 36.00, 30.00, 'SALE', 32, 1, 'فرۆشتنی وەسڵ INV-20261009-001', '2026-10-09 20:37:47'),
(126, 19, 'SALE', NULL, 1.00, 24.00, 23.00, 'SALE', 32, 1, 'فرۆشتنی وەسڵ INV-20261009-001', '2026-10-09 20:37:47'),
(127, 18, 'SALE', NULL, 1.00, 28.00, 27.00, 'SALE', 32, 1, 'فرۆشتنی وەسڵ INV-20261009-001', '2026-10-09 20:37:47'),
(128, 17, 'SALE', NULL, 1.00, 32.00, 31.00, 'SALE', 32, 1, 'فرۆشتنی وەسڵ INV-20261009-001', '2026-10-09 20:37:47'),
(129, 20, 'SALE', NULL, 1.00, 30.00, 29.00, 'SALE', 33, 1, 'فرۆشتنی وەسڵ INV-20261010-001', '2026-10-10 14:22:08'),
(130, 19, 'SALE', NULL, 1.00, 23.00, 22.00, 'SALE', 33, 1, 'فرۆشتنی وەسڵ INV-20261010-001', '2026-10-10 14:22:08'),
(131, 18, 'SALE', NULL, 1.00, 27.00, 26.00, 'SALE', 33, 1, 'فرۆشتنی وەسڵ INV-20261010-001', '2026-10-10 14:22:08'),
(132, 20, 'SALE', NULL, 2.00, 29.00, 27.00, 'SALE', 34, 1, 'فرۆشتنی وەسڵ INV-20261010-002', '2026-10-10 14:24:32'),
(133, 1, 'RETURN', NULL, 1.00, 48.00, 49.00, 'RETURN', 2, 1, 'گێڕانەوە لە وەسڵی DEMO-SALE-0001', '2026-10-10 14:32:38'),
(134, 5, 'RETURN', NULL, 1.00, 60.00, 61.00, 'RETURN', 3, 1, 'گێڕانەوە لە وەسڵی DEMO-SALE-0001', '2026-10-10 14:33:38'),
(135, 20, 'SALE', NULL, 1.00, 27.00, 26.00, 'SALE', 35, 1, 'فرۆشتنی وەسڵ INV-20261010-003', '2026-10-10 14:42:19'),
(136, 20, 'RETURN', NULL, 1.00, 26.00, 27.00, 'RETURN', 4, 1, 'گێڕانەوە لە وەسڵی INV-20261010-003', '2026-10-10 14:43:05'),
(137, 20, 'DAMAGE', 'EXPIRED', 1.00, 27.00, 26.00, 'DAMAGE', NULL, 1, 'رررر', '2026-10-10 14:53:13'),
(138, 6, 'ADJUSTMENT', NULL, 5.00, 30.00, 25.00, 'PURCHASE_REVERSAL', 1, 1, 'گەڕاندنەوەی کاڵا بەهۆی سڕینەوەی پسوولەی DEMO-PUR-0001', '2026-10-10 14:57:01'),
(140, 12, 'PURCHASE', NULL, 300.00, 120.00, 420.00, 'PURCHASE', 3, 1, 'کڕین لە دابینکەر - پسوولەی PUR-1791655415773', '2026-10-10 15:36:07');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_purchases` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_paid` decimal(14,2) NOT NULL DEFAULT 0.00,
  `debt` decimal(14,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `company`, `phone`, `address`, `notes`, `total_purchases`, `total_paid`, `debt`, `created_at`, `updated_at`) VALUES
(3, 'لیز', 'لیز', '07701234567', 'سلێمانیی', '٢٢٢٢', 300000.00, 150000.00, 150000.00, '2026-10-10 15:02:55', '2026-10-10 15:36:07');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

CREATE TABLE `units` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name_ku` varchar(50) NOT NULL,
  `name_en` varchar(50) NOT NULL,
  `name_ar` varchar(50) NOT NULL,
  `short_code` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name_ku`, `name_en`, `name_ar`, `short_code`) VALUES
(1, 'دانە', 'Piece', 'قطعة', 'pcs'),
(2, 'کیلۆگرام', 'Kilogram', 'كيلوغرام', 'kg'),
(3, 'پاکەت', 'Pack', 'علبة / باكت', 'pack'),
(4, 'کارتۆن', 'Carton', 'كرتونة', 'ctn'),
(5, 'لیتر', 'Liter', 'لتر', 'L');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  `language_pref` varchar(10) NOT NULL DEFAULT 'ku',
  `phone` varchar(30) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `permissions_customized` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role_id`, `status`, `language_pref`, `phone`, `email`, `last_login`, `remember_token`, `created_at`, `updated_at`, `permissions_customized`) VALUES
(1, 'Admin', 'admin', '$2y$12$Z.05zf8X4MJB2FWicuk9oeBQFooyFOqULZM78OfOd4GSlakdvTRa.', 1, 'ACTIVE', 'ku', NULL, NULL, '2026-10-09 19:48:31', NULL, '2026-10-09 19:38:22', '2026-10-09 19:48:31', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `permission_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `activity_logs_user_id_index` (`user_id`),
  ADD KEY `activity_logs_action_index` (`action`),
  ADD KEY `activity_logs_created_at_index` (`created_at`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cash_register_accounts`
--
ALTER TABLE `cash_register_accounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cash_register_shifts`
--
ALTER TABLE `cash_register_shifts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cash_register_shifts_active_slot_unique` (`active_slot`),
  ADD KEY `cash_register_shifts_closed_by_foreign` (`closed_by`),
  ADD KEY `cash_register_shifts_opened_by_opened_at_index` (`opened_by`,`opened_at`);

--
-- Indexes for table `cash_register_transactions`
--
ALTER TABLE `cash_register_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cash_register_transactions_source_type_source_id_unique` (`source_type`,`source_id`),
  ADD UNIQUE KEY `cash_register_transactions_transaction_number_unique` (`transaction_number`),
  ADD UNIQUE KEY `cash_register_transactions_idempotency_key_unique` (`idempotency_key`),
  ADD KEY `cash_register_transactions_shift_id_foreign` (`shift_id`),
  ADD KEY `cash_register_transactions_type_created_at_index` (`type`,`created_at`),
  ADD KEY `cash_register_transactions_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `cash_register_transactions_transaction_number_index` (`transaction_number`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customers_name_index` (`name`),
  ADD KEY `customers_phone_index` (`phone`),
  ADD KEY `customers_debt_index` (`debt`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `expenses_idempotency_key_unique` (`idempotency_key`),
  ADD KEY `expenses_user_id_foreign` (`user_id`),
  ADD KEY `expenses_category_id_index` (`category_id`),
  ADD KEY `expenses_date_index` (`date`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_idempotency_key_unique` (`idempotency_key`),
  ADD KEY `payments_user_id_foreign` (`user_id`),
  ADD KEY `payments_payment_type_index` (`payment_type`),
  ADD KEY `payments_party_type_index` (`party_type`),
  ADD KEY `payments_party_id_index` (`party_id`),
  ADD KEY `payments_created_at_index` (`created_at`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_unique` (`name`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_barcode_unique` (`barcode`),
  ADD UNIQUE KEY `products_sku_unique` (`sku`),
  ADD KEY `products_unit_id_foreign` (`unit_id`),
  ADD KEY `products_barcode_index` (`barcode`),
  ADD KEY `products_sku_index` (`sku`),
  ADD KEY `products_category_id_index` (`category_id`),
  ADD KEY `products_quantity_index` (`quantity`),
  ADD KEY `products_expiry_date_index` (`expiry_date`),
  ADD KEY `products_status_index` (`status`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchases_invoice_number_unique` (`invoice_number`),
  ADD KEY `purchases_user_id_foreign` (`user_id`),
  ADD KEY `purchases_invoice_number_index` (`invoice_number`),
  ADD KEY `purchases_supplier_id_index` (`supplier_id`),
  ADD KEY `purchases_created_at_index` (`created_at`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_items_purchase_id_index` (`purchase_id`),
  ADD KEY `purchase_items_product_id_index` (`product_id`);

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `returns_idempotency_key_unique` (`idempotency_key`),
  ADD KEY `returns_customer_id_foreign` (`customer_id`),
  ADD KEY `returns_user_id_foreign` (`user_id`),
  ADD KEY `returns_sale_id_index` (`sale_id`),
  ADD KEY `returns_invoice_number_index` (`invoice_number`);

--
-- Indexes for table `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `return_items_return_id_index` (`return_id`),
  ADD KEY `return_items_product_id_index` (`product_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_unique` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`role_id`,`permission_id`),
  ADD KEY `role_permissions_permission_id_foreign` (`permission_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sales_invoice_number_unique` (`invoice_number`),
  ADD UNIQUE KEY `sales_idempotency_key_unique` (`idempotency_key`),
  ADD KEY `sales_invoice_number_index` (`invoice_number`),
  ADD KEY `sales_created_at_index` (`created_at`),
  ADD KEY `sales_user_id_index` (`user_id`),
  ADD KEY `sales_customer_id_index` (`customer_id`),
  ADD KEY `sales_payment_method_index` (`payment_method`),
  ADD KEY `sales_payment_status_index` (`payment_status`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_items_sale_id_index` (`sale_id`),
  ADD KEY `sale_items_product_id_index` (`product_id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_name_unique` (`key_name`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_user_id_foreign` (`user_id`),
  ADD KEY `stock_movements_product_id_index` (`product_id`),
  ADD KEY `stock_movements_movement_type_index` (`movement_type`),
  ADD KEY `stock_movements_created_at_index` (`created_at`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `suppliers_name_index` (`name`),
  ADD KEY `suppliers_company_index` (`company`),
  ADD KEY `suppliers_debt_index` (`debt`);

--
-- Indexes for table `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`),
  ADD KEY `users_username_index` (`username`),
  ADD KEY `users_role_id_index` (`role_id`),
  ADD KEY `users_status_index` (`status`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`user_id`,`permission_id`),
  ADD KEY `user_permissions_permission_id_foreign` (`permission_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `cash_register_shifts`
--
ALTER TABLE `cash_register_shifts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `cash_register_transactions`
--
ALTER TABLE `cash_register_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `expense_categories`
--
ALTER TABLE `expense_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `returns`
--
ALTER TABLE `returns`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `return_items`
--
ALTER TABLE `return_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `sale_items`
--
ALTER TABLE `sale_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=132;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=141;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `units`
--
ALTER TABLE `units`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD CONSTRAINT `activity_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `cash_register_shifts`
--
ALTER TABLE `cash_register_shifts`
  ADD CONSTRAINT `cash_register_shifts_closed_by_foreign` FOREIGN KEY (`closed_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cash_register_shifts_opened_by_foreign` FOREIGN KEY (`opened_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `cash_register_transactions`
--
ALTER TABLE `cash_register_transactions`
  ADD CONSTRAINT `cash_register_transactions_shift_id_foreign` FOREIGN KEY (`shift_id`) REFERENCES `cash_register_shifts` (`id`),
  ADD CONSTRAINT `cash_register_transactions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `expense_categories` (`id`),
  ADD CONSTRAINT `expenses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `products_unit_id_foreign` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`);

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_supplier_id_foreign` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`),
  ADD CONSTRAINT `purchases_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `purchase_items_purchase_id_foreign` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `returns`
--
ALTER TABLE `returns`
  ADD CONSTRAINT `returns_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `returns_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `returns_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `return_items`
--
ALTER TABLE `return_items`
  ADD CONSTRAINT `return_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `return_items_return_id_foreign` FOREIGN KEY (`return_id`) REFERENCES `returns` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `sales_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `sale_items_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `sale_items_sale_id_foreign` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `stock_movements_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);

--
-- Constraints for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD CONSTRAINT `user_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_permissions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
