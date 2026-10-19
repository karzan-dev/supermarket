-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 19, 2026 at 11:46 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u640945903_supermarket`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `action` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `activity_logs_user_id_index` (`user_id`),
  KEY `activity_logs_action_index` (`action`),
  KEY `activity_logs_created_at_index` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=188 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(24, 1, 'PURCHASE', 'PURCHASE', 3, '127.0.0.1', 'کڕینی کاڵا لە دابینکەر لیز بە کۆی 300000', '2026-10-10 15:36:07'),
(25, 1, 'LOGIN', 'USER', 1, '185.95.206.109', 'User admin logged in successfully', '2026-10-10 22:39:26'),
(26, 1, 'CREATE', 'PRODUCT', 21, '185.95.206.109', 'Added product جۆ (5709730406254)', '2026-10-10 22:41:30'),
(27, 1, 'UPDATE', 'PRODUCT', 21, '185.95.206.109', 'Updated product جۆ (5709730406254)', '2026-10-10 22:41:51'),
(28, 1, 'LOGIN', 'USER', 1, '185.95.206.16', 'User admin logged in successfully', '2026-10-10 22:41:58'),
(29, 1, 'LOGOUT', 'USER', 1, '185.95.206.16', 'User admin logged out', '2026-10-10 22:52:21'),
(30, 1, 'LOGIN', 'USER', 1, '185.95.206.16', 'User admin logged in successfully', '2026-10-10 22:52:56'),
(31, 1, 'UPDATE', 'SETTING', 0, '185.95.206.16', 'نوێکردنەوەی رێکخستنەکانی سیستەم', '2026-10-10 23:00:37'),
(32, 1, 'LOGIN', 'USER', 1, '151.236.179.94', 'User admin logged in successfully', '2026-10-10 23:06:43'),
(33, 1, 'CREATE', 'PRODUCT', 22, '185.95.206.16', 'Added product ئاسان (9551007521773)', '2026-10-10 23:08:28'),
(34, 1, 'LOGIN', 'USER', 1, '151.236.179.94', 'User admin logged in successfully', '2026-10-11 00:01:47'),
(35, 1, 'LOGOUT', 'USER', 1, '151.236.166.74', 'User admin logged out', '2026-10-11 01:24:32'),
(36, 1, 'LOGIN', 'USER', 1, '151.236.166.74', 'User admin logged in successfully', '2026-10-11 01:24:45'),
(37, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 8, '185.95.206.16', 'Cash sale INV-20261011-001 (8350.00)', '2026-10-11 01:25:29'),
(38, 1, 'SALE', 'SALE', 36, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-001 بە بڕی 8350', '2026-10-11 01:25:29'),
(39, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 9, '185.95.206.16', 'Cash sale INV-20261011-002 (19500.00)', '2026-10-11 01:30:04'),
(40, 1, 'SALE', 'SALE', 37, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-002 بە بڕی 19500', '2026-10-11 01:30:04'),
(41, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 10, '185.95.206.16', 'Cash sale INV-20261011-003 (4250.00)', '2026-10-11 01:33:44'),
(42, 1, 'SALE', 'SALE', 38, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-003 بە بڕی 4250', '2026-10-11 01:33:44'),
(43, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 11, '185.95.206.16', 'Cash sale INV-20261011-004 (250.00)', '2026-10-11 01:33:50'),
(44, 1, 'SALE', 'SALE', 39, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-004 بە بڕی 250', '2026-10-11 01:33:50'),
(45, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 12, '185.95.206.16', 'Cash sale INV-20261011-005 (600.00)', '2026-10-11 01:33:57'),
(46, 1, 'SALE', 'SALE', 40, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-005 بە بڕی 600', '2026-10-11 01:33:57'),
(47, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 13, '185.95.206.16', 'Cash sale INV-20261011-006 (3250.00)', '2026-10-11 01:34:07'),
(48, 1, 'SALE', 'SALE', 41, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-006 بە بڕی 3250', '2026-10-11 01:34:07'),
(49, 1, 'LOGIN', 'USER', 1, '185.95.206.16', 'User admin logged in successfully', '2026-10-11 01:34:54'),
(50, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 14, '185.95.206.16', 'Cash sale INV-20261011-007 (3250.00)', '2026-10-11 01:35:08'),
(51, 1, 'SALE', 'SALE', 42, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-007 بە بڕی 3250', '2026-10-11 01:35:08'),
(52, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 15, '185.95.206.16', 'Cash sale INV-20261011-008 (3250.00)', '2026-10-11 01:35:44'),
(53, 1, 'SALE', 'SALE', 43, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-008 بە بڕی 3250', '2026-10-11 01:35:44'),
(54, 1, 'LOGIN', 'USER', 1, '2a12:f680:260:2c55:cb5:2bff:fe28:3cf7', 'User admin logged in successfully', '2026-10-11 03:37:05'),
(55, 1, 'CREATE', 'PRODUCT', 23, '185.95.206.16', 'Added product اوە خۆشەکە (5641725442574)', '2026-10-11 07:28:55'),
(56, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 16, '185.95.206.16', 'Cash sale INV-20261011-009 (250.00)', '2026-10-11 07:29:40'),
(57, 1, 'SALE', 'SALE', 44, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-009 بە بڕی 250', '2026-10-11 07:29:40'),
(58, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 17, '185.95.206.16', 'Cash sale INV-20261011-010 (500.00)', '2026-10-11 07:30:50'),
(59, 1, 'SALE', 'SALE', 45, '185.95.206.16', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-010 بە بڕی 500', '2026-10-11 07:30:50'),
(60, 1, 'LOGIN', 'USER', 1, '185.240.19.123', 'User admin logged in successfully', '2026-10-11 08:09:13'),
(61, 1, 'LOGIN', 'USER', 1, '185.244.152.227', 'User admin logged in successfully', '2026-10-11 08:40:41'),
(62, 1, 'LOGIN', 'USER', 1, '185.244.152.227', 'User admin logged in successfully', '2026-10-11 08:48:23'),
(63, 1, 'UPDATE', 'PRODUCT', 21, '185.244.152.227', 'Updated product جۆ (5709730406254)', '2026-10-11 09:10:13'),
(64, 1, 'LOGIN', 'USER', 1, '185.95.206.123', 'User admin logged in successfully', '2026-10-11 09:35:45'),
(65, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 18, '185.95.206.123', 'Cash sale INV-20261011-011 (4000.00)', '2026-10-11 09:39:18'),
(66, 1, 'SALE', 'SALE', 46, '185.95.206.123', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-011 بە بڕی 4000', '2026-10-11 09:39:18'),
(67, 1, 'CREATE', 'PRODUCT', 24, '185.244.152.227', 'Added product deluxe (8690504119579)', '2026-10-11 10:15:08'),
(68, 1, 'UPDATE', 'PRODUCT', 24, '185.244.152.227', 'Updated product deluxe (8690504119579)', '2026-10-11 10:20:51'),
(69, 1, 'LOGOUT', 'USER', 1, '185.244.152.227', 'User admin logged out', '2026-10-11 10:21:18'),
(70, 1, 'LOGIN', 'USER', 1, '185.244.152.227', 'User admin logged in successfully', '2026-10-11 10:21:24'),
(71, 1, 'UPDATE', 'CUSTOMER', 4, '185.244.152.227', 'Updated customer Sho', '2026-10-11 10:25:04'),
(72, 1, 'UPDATE', 'CUSTOMER', 3, '185.244.152.227', 'Updated customer Demo Customer', '2026-10-11 10:26:14'),
(73, 1, 'UPDATE', 'PRODUCT', 21, '185.244.152.227', 'Updated product جۆ (5709730406254)', '2026-10-11 11:00:40'),
(74, 1, 'UPDATE', 'CUSTOMER', 4, '185.244.152.227', 'Updated customer Sho', '2026-10-11 11:03:27'),
(75, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 19, '185.244.152.227', 'Customer debt payment from Sho (1500.00)', '2026-10-11 11:04:23'),
(76, 1, 'PAYMENT', 'CUSTOMER', 4, '185.244.152.227', 'دانەوەی قەرزی کڕیار Sho بە بڕی 1500', '2026-10-11 11:04:23'),
(77, 1, 'UPDATE', 'CUSTOMER', 4, '185.244.152.227', 'Updated customer Sho', '2026-10-11 11:05:32'),
(78, 1, 'CREATE', 'CUSTOMER', 5, '185.244.152.227', 'Added customer ;', '2026-10-11 11:06:36'),
(79, 1, 'DELETE', 'CUSTOMER', 5, '185.244.152.227', 'Deleted customer ;', '2026-10-11 11:08:16'),
(80, 1, 'UPDATE', 'SETTING', 0, '185.244.152.227', 'نوێکردنەوەی رێکخستنەکانی سیستەم', '2026-10-11 11:38:14'),
(81, 1, 'CREATE', 'CUSTOMER', 6, '185.244.152.227', 'Added customer hawzhin', '2026-10-11 11:53:31'),
(82, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 20, '185.244.152.227', 'Cash sale INV-20261011-012 (17800.00)', '2026-10-11 12:15:41'),
(83, 1, 'SALE', 'SALE', 47, '185.244.152.227', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-012 بە بڕی 17800', '2026-10-11 12:15:41'),
(84, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 21, '185.244.152.227', 'Cash sale INV-20261011-013 (11100.00)', '2026-10-11 12:16:27'),
(85, 1, 'SALE', 'SALE', 48, '185.244.152.227', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-013 بە بڕی 11100', '2026-10-11 12:16:27'),
(86, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 22, '185.244.152.227', 'Cash sale INV-20261011-014 (54100.00)', '2026-10-11 12:17:08'),
(87, 1, 'SALE', 'SALE', 49, '185.244.152.227', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-014 بە بڕی 54100', '2026-10-11 12:17:08'),
(88, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 23, '185.244.152.227', 'Cash sale INV-20261011-015 (13250.00)', '2026-10-11 12:17:59'),
(89, 1, 'SALE', 'SALE', 50, '185.244.152.227', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-015 بە بڕی 13250', '2026-10-11 12:17:59'),
(90, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 24, '185.244.152.227', 'Cash sale INV-20261011-016 (22300.00)', '2026-10-11 12:25:58'),
(91, 1, 'SALE', 'SALE', 51, '185.244.152.227', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-016 بە بڕی 22300', '2026-10-11 12:25:58'),
(92, 1, 'UPDATE', 'CUSTOMER', 2, '185.244.152.227', 'Updated customer شڤان سەردار کەریم', '2026-10-11 12:46:58'),
(93, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 25, '185.244.152.227', 'Cash sale INV-20261011-017 (11750.00)', '2026-10-11 14:20:47'),
(94, 1, 'SALE', 'SALE', 52, '185.244.152.227', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-017 بە بڕی 11750', '2026-10-11 14:20:47'),
(95, 1, 'LOGIN', 'USER', 1, '185.95.206.109', 'User admin logged in successfully', '2026-10-11 14:47:33'),
(96, 1, 'LOGIN', 'USER', 1, '185.95.206.109', 'User admin logged in successfully', '2026-10-11 14:48:31'),
(97, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 26, '185.95.206.109', 'Cash sale INV-20261011-018 (7000.00)', '2026-10-11 14:51:28'),
(98, 1, 'SALE', 'SALE', 53, '185.95.206.109', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-018 بە بڕی 7000', '2026-10-11 14:51:28'),
(99, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 27, '185.95.206.109', 'Cash received for credit sale INV-20261011-019 (250.00)', '2026-10-11 14:52:30'),
(100, 1, 'SALE', 'SALE', 54, '185.95.206.109', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-019 بە بڕی 2500', '2026-10-11 14:52:30'),
(101, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 28, '185.95.206.109', 'Cash sale INV-20261011-020 (2250.00)', '2026-10-11 15:01:16'),
(102, 1, 'SALE', 'SALE', 55, '185.95.206.109', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-020 بە بڕی 2250', '2026-10-11 15:01:16'),
(103, 1, 'DELETE', 'PURCHASE', 3, '185.244.152.135', 'سڕینەوەی کڕینی پسوولەی PUR-1791655415773', '2026-10-11 16:13:30'),
(104, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 29, '185.244.152.135', 'Cash received for credit sale INV-20261011-021 (8.75)', '2026-10-11 16:14:57'),
(105, 1, 'SALE', 'SALE', 56, '185.244.152.135', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-021 بە بڕی 8850', '2026-10-11 16:14:57'),
(106, 1, 'DELETE', 'CUSTOMER', 2, '185.244.152.135', 'Deleted customer شڤان سەردار کەریم', '2026-10-11 16:23:24'),
(107, 1, 'DELETE', 'CUSTOMER', 3, '185.244.152.135', 'Deleted customer Demo Customer', '2026-10-11 16:23:31'),
(108, 1, 'DELETE', 'CUSTOMER', 6, '185.244.152.135', 'Deleted customer hawzhin', '2026-10-11 16:23:36'),
(109, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 30, '185.244.152.135', 'Customer debt payment from دانا محەمەد ڕەشید (50000.00)', '2026-10-11 16:23:45'),
(110, 1, 'PAYMENT', 'CUSTOMER', 1, '185.244.152.135', 'دانەوەی قەرزی کڕیار دانا محەمەد ڕەشید بە بڕی 50000', '2026-10-11 16:23:45'),
(111, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 31, '185.244.152.135', 'Customer debt payment from Sho (8841.25)', '2026-10-11 16:23:59'),
(112, 1, 'PAYMENT', 'CUSTOMER', 4, '185.244.152.135', 'دانەوەی قەرزی کڕیار Sho بە بڕی 8841.25', '2026-10-11 16:23:59'),
(113, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 32, '185.244.152.135', 'Customer debt payment from krr (2250.00)', '2026-10-11 16:24:11'),
(114, 1, 'PAYMENT', 'CUSTOMER', 7, '185.244.152.135', 'دانەوەی قەرزی کڕیار krr بە بڕی 2250', '2026-10-11 16:24:11'),
(115, 1, 'DELETE', 'CUSTOMER', 1, '185.244.152.135', 'Deleted customer دانا محەمەد ڕەشید', '2026-10-11 16:24:17'),
(116, 1, 'DELETE', 'CUSTOMER', 4, '185.244.152.135', 'Deleted customer Sho', '2026-10-11 16:24:21'),
(117, 1, 'DELETE', 'CUSTOMER', 7, '185.244.152.135', 'Deleted customer krr', '2026-10-11 16:24:27'),
(118, 1, 'CREATE', 'CUSTOMER', 8, '185.244.152.135', 'Added customer sho', '2026-10-11 16:26:00'),
(119, 1, 'CREATE', 'CUSTOMER', 9, '185.244.152.135', 'Added customer hawzhin', '2026-10-11 16:27:21'),
(120, 1, 'CREATE', 'CUSTOMER', 10, '185.244.152.135', 'Added customer pewra najat', '2026-10-11 16:34:51'),
(121, 1, 'UPDATE', 'CUSTOMER', 10, '185.244.152.135', 'Updated customer pshraw najat', '2026-10-11 16:35:28'),
(122, 1, 'CREATE', 'CUSTOMER', 11, '185.244.152.135', 'Added customer hdd bxada', '2026-10-11 16:38:44'),
(123, 1, 'CREATE', 'CUSTOMER', 12, '185.244.152.135', 'Added customer karzan bikap', '2026-10-11 16:39:16'),
(124, 1, 'CREATE', 'CUSTOMER', 13, '185.244.152.135', 'Added customer daiki peshraw najat', '2026-10-11 16:43:59'),
(125, 1, 'CREATE', 'CUSTOMER', 14, '185.244.152.135', 'Added customer nur', '2026-10-11 16:46:16'),
(126, 1, 'CREATE', 'CUSTOMER', 15, '185.244.152.135', 'Added customer azhin jegar', '2026-10-11 16:48:47'),
(127, 1, 'CREATE', 'CUSTOMER', 16, '185.244.152.135', 'Added customer havin plkm', '2026-10-11 16:51:18'),
(128, 1, 'CREATE', 'CUSTOMER', 17, '185.244.152.135', 'Added customer xezani bkr', '2026-10-11 16:51:45'),
(129, 1, 'CREATE', 'CUSTOMER', 18, '185.244.152.135', 'Added customer ahmmed sabir', '2026-10-11 16:52:12'),
(130, 1, 'CREATE', 'CUSTOMER', 19, '185.244.152.135', 'Added customer pola', '2026-10-11 16:53:22'),
(131, 1, 'CREATE', 'CUSTOMER', 20, '185.244.152.135', 'Added customer buke pare', '2026-10-11 16:53:57'),
(132, 1, 'CREATE', 'CUSTOMER', 21, '185.244.152.135', 'Added customer daiki hawkar', '2026-10-11 16:54:24'),
(133, 1, 'CREATE', 'CUSTOMER', 22, '185.244.152.135', 'Added customer mam fuad turkman', '2026-10-11 16:55:00'),
(134, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 33, '185.244.152.135', 'Cash received for credit sale INV-20261011-022 (43.00)', '2026-10-11 16:56:32'),
(135, 1, 'SALE', 'SALE', 57, '185.244.152.135', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-022 بە بڕی 43100', '2026-10-11 16:56:32'),
(136, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 34, '185.244.152.135', 'Cash received for credit sale INV-20261011-023 (9500.00)', '2026-10-11 16:57:20'),
(137, 1, 'SALE', 'SALE', 58, '185.244.152.135', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-023 بە بڕی 9500', '2026-10-11 16:57:20'),
(138, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 35, '185.244.152.135', 'Customer debt payment from pola (43057.00)', '2026-10-11 16:57:43'),
(139, 1, 'PAYMENT', 'CUSTOMER', 19, '185.244.152.135', 'دانەوەی قەرزی کڕیار pola بە بڕی 43057', '2026-10-11 16:57:43'),
(140, 1, 'DELETE', 'CUSTOMER', 19, '185.244.152.135', 'Deleted customer pola', '2026-10-11 16:58:09'),
(141, 1, 'CREATE', 'CUSTOMER', 23, '185.244.152.135', 'Added customer pola', '2026-10-11 16:58:24'),
(142, 1, 'LOGIN', 'USER', 1, '2a05:9cc4:412:952:e39d:fe02:1ad6:6a55', 'User admin logged in successfully', '2026-10-11 18:16:07'),
(143, 1, 'CREATE', 'PRODUCT', 25, '185.244.152.135', 'Added product msk (6253805190290)', '2026-10-11 18:27:49'),
(144, 1, 'CREATE', 'PRODUCT', 26, '185.244.152.135', 'Added product loura (6260463800225)', '2026-10-11 18:29:44'),
(145, 1, 'LOGIN', 'USER', 1, '93.88.156.71', 'User admin logged in successfully', '2026-10-11 19:13:01'),
(146, 1, 'LOGIN', 'USER', 1, '185.95.207.53', 'User admin logged in successfully', '2026-10-11 19:31:43'),
(147, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 36, '93.88.156.71', 'Cash sale INV-20261011-024 (500.00)', '2026-10-11 20:00:49'),
(148, 1, 'SALE', 'SALE', 59, '93.88.156.71', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261011-024 بە بڕی 500', '2026-10-11 20:00:49'),
(149, 1, 'LOGIN', 'USER', 1, '185.244.152.135', 'User admin logged in successfully', '2026-10-12 00:52:13'),
(150, 1, 'LOGIN', 'USER', 1, '185.244.152.135', 'User admin logged in successfully', '2026-10-12 06:17:53'),
(151, 1, 'CREATE', 'PRODUCT', 27, '185.244.152.135', 'Added product alen (8699965895909)', '2026-10-12 07:36:49'),
(152, 1, 'UPDATE', 'PRODUCT', 27, '185.244.152.135', 'Updated product alen (8699965895909)', '2026-10-12 07:39:56'),
(153, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 37, '185.244.152.135', 'Cash sale INV-20261012-001 (5000.00)', '2026-10-12 07:43:58'),
(154, 1, 'SALE', 'SALE', 60, '185.244.152.135', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261012-001 بە بڕی 5000', '2026-10-12 07:43:58'),
(155, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 38, '185.244.152.135', 'Cash sale INV-20261012-002 (13000.00)', '2026-10-12 07:49:05'),
(156, 1, 'SALE', 'SALE', 61, '185.244.152.135', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261012-002 بە بڕی 13000', '2026-10-12 07:49:05'),
(157, 1, 'CREATE', 'PRODUCT', 28, '185.244.152.135', 'Added product loura (9005182013566)', '2026-10-12 07:49:31'),
(158, 1, 'DELETE', 'PRODUCT', 28, '185.244.152.135', 'Archived product loura', '2026-10-12 07:52:03'),
(159, 1, 'DELETE', 'PRODUCT', 27, '185.244.152.135', 'Archived product alen', '2026-10-12 07:52:06'),
(160, 1, 'DELETE', 'PRODUCT', 25, '185.244.152.135', 'Archived product msk', '2026-10-12 07:52:09'),
(161, 1, 'DELETE', 'PRODUCT', 22, '185.244.152.135', 'Archived product ئاسان', '2026-10-12 07:52:12'),
(162, 1, 'DELETE', 'PRODUCT', 23, '185.244.152.135', 'Archived product اوە خۆشەکە', '2026-10-12 07:52:22'),
(163, 1, 'CREATE', 'PRODUCT', 29, '185.244.152.135', 'Added product iced coffee (5900820011468)', '2026-10-12 07:52:42'),
(164, 1, 'CREATE', 'PRODUCT', 30, '185.244.152.135', 'Added product taciuaty (8690526019383)', '2026-10-12 07:56:51'),
(165, 1, 'DELETE', 'PRODUCT', 30, '185.244.152.135', 'Archived product taciuaty', '2026-10-12 07:59:19'),
(166, 1, 'CREATE', 'PRODUCT', 31, '185.244.152.135', 'Added product aw (8345654359626)', '2026-10-12 08:08:27'),
(167, 1, 'CREATE', 'PRODUCT', 32, '185.244.152.135', 'Added product beking powder (8690545470301)', '2026-10-12 08:12:02'),
(168, 1, 'UPDATE', 'PRODUCT', 31, '185.244.152.135', 'Updated product aw (8345654359626)', '2026-10-12 08:22:36'),
(169, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 39, '185.244.152.135', 'Cash sale INV-20261012-003 (5000.00)', '2026-10-12 08:23:47'),
(170, 1, 'SALE', 'SALE', 62, '185.244.152.135', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261012-003 بە بڕی 5000', '2026-10-12 08:23:47'),
(171, 1, 'UPDATE', 'PRODUCT', 31, '185.244.152.135', 'Updated product aw (8345654359626)', '2026-10-12 08:24:42'),
(172, 1, 'CASH_SALE', 'CASH_REGISTER_TRANSACTION', 40, '185.244.152.135', 'Cash sale INV-20261012-004 (2500.00)', '2026-10-12 08:24:59'),
(173, 1, 'SALE', 'SALE', 63, '185.244.152.135', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261012-004 بە بڕی 2500', '2026-10-12 08:24:59'),
(174, 1, 'LOGIN', 'USER', 1, '185.244.152.68', 'User admin logged in successfully', '2026-10-12 12:09:56'),
(175, 1, 'LOGIN', 'USER', 1, '127.0.0.1', 'User admin logged in successfully', '2026-10-13 08:48:35'),
(176, 1, 'LOGOUT', 'USER', 1, '127.0.0.1', 'User admin logged out', '2026-10-13 08:48:56'),
(177, 1, 'LOGIN', 'USER', 1, '127.0.0.1', 'User admin logged in successfully', '2026-10-13 08:48:58'),
(178, 1, 'LOGOUT', 'USER', 1, '127.0.0.1', 'User admin logged out', '2026-10-13 08:53:47'),
(179, 1, 'LOGOUT', 'USER', 1, '127.0.0.1', 'User admin logged out', '2026-10-13 08:54:53'),
(180, 1, 'LOGIN', 'USER', 1, '127.0.0.1', 'User admin logged in successfully', '2026-10-13 08:54:55'),
(181, 1, 'CREATE', 'PRODUCT', 33, '127.0.0.1', 'Added product کارزان (2042883620997)', '2026-10-13 08:57:48'),
(182, 1, 'LOGIN', 'USER', 1, '127.0.0.1', 'User admin logged in successfully', '2026-10-13 09:07:42'),
(185, 1, 'CASH_CUSTOMER_PAYMENT', 'CASH_REGISTER_TRANSACTION', 41, '127.0.0.1', 'Cash received for credit sale INV-20261013-001 (12.00)', '2026-10-13 17:01:47'),
(186, 1, 'SALE', 'SALE', 64, '127.0.0.1', 'تەواوکردنی فرۆشتنی وەسڵ INV-20261013-001 بە بڕی 2500', '2026-10-13 17:01:47'),
(187, 1, 'LOGIN', 'USER', 1, '127.0.0.1', 'User admin logged in successfully', '2026-10-13 17:44:21');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('supermarket-froshgay-cache-5c785c036466adea360111aa28563bfd556b5fba', 'i:4;', 1791924289),
('supermarket-froshgay-cache-5c785c036466adea360111aa28563bfd556b5fba:timer', 'i:1791924289;', 1791924289);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cash_register_accounts`
--

DROP TABLE IF EXISTS `cash_register_accounts`;
CREATE TABLE IF NOT EXISTS `cash_register_accounts` (
  `id` tinyint UNSIGNED NOT NULL,
  `balance` decimal(14,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cash_register_accounts`
--

INSERT INTO `cash_register_accounts` (`id`, `balance`, `created_at`, `updated_at`) VALUES
(1, 340212.00, '2026-10-09 19:38:21', '2026-10-13 17:01:47');

-- --------------------------------------------------------

--
-- Table structure for table `cash_register_shifts`
--

DROP TABLE IF EXISTS `cash_register_shifts`;
CREATE TABLE IF NOT EXISTS `cash_register_shifts` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `opened_by` bigint UNSIGNED NOT NULL,
  `closed_by` bigint UNSIGNED DEFAULT NULL,
  `active_slot` tinyint UNSIGNED DEFAULT NULL,
  `opening_balance` decimal(14,2) NOT NULL,
  `expected_balance` decimal(14,2) DEFAULT NULL,
  `counted_balance` decimal(14,2) DEFAULT NULL,
  `variance` decimal(14,2) DEFAULT NULL,
  `opening_notes` text COLLATE utf8mb4_unicode_ci,
  `closing_notes` text COLLATE utf8mb4_unicode_ci,
  `opened_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `closed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cash_register_shifts_active_slot_unique` (`active_slot`),
  KEY `cash_register_shifts_closed_by_foreign` (`closed_by`),
  KEY `cash_register_shifts_opened_by_opened_at_index` (`opened_by`,`opened_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cash_register_shifts`
--

INSERT INTO `cash_register_shifts` (`id`, `opened_by`, `closed_by`, `active_slot`, `opening_balance`, `expected_balance`, `counted_balance`, `variance`, `opening_notes`, `closing_notes`, `opened_at`, `closed_at`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 1, 0.00, NULL, NULL, NULL, NULL, NULL, '2026-10-09 20:37:47', NULL, '2026-10-09 20:37:47', '2026-10-09 20:37:47');

-- --------------------------------------------------------

--
-- Table structure for table `cash_register_transactions`
--

DROP TABLE IF EXISTS `cash_register_transactions`;
CREATE TABLE IF NOT EXISTS `cash_register_transactions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `transaction_number` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shift_id` bigint UNSIGNED DEFAULT NULL,
  `type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direction` enum('IN','OUT') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `balance_before` decimal(14,2) NOT NULL,
  `balance_after` decimal(14,2) NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `source_type` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_id` bigint UNSIGNED DEFAULT NULL,
  `idempotency_key` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cash_register_transactions_source_type_source_id_unique` (`source_type`,`source_id`),
  UNIQUE KEY `cash_register_transactions_transaction_number_unique` (`transaction_number`),
  UNIQUE KEY `cash_register_transactions_idempotency_key_unique` (`idempotency_key`),
  KEY `cash_register_transactions_shift_id_foreign` (`shift_id`),
  KEY `cash_register_transactions_type_created_at_index` (`type`,`created_at`),
  KEY `cash_register_transactions_user_id_created_at_index` (`user_id`,`created_at`),
  KEY `cash_register_transactions_transaction_number_index` (`transaction_number`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(7, 'CSH-20261010-00000007', 1, 'RETURN', 'OUT', 1400.00, 13150.00, 11750.00, 'Cash refund for INV-20261010-003', 'ssss', 'RETURN', 4, NULL, 1, '2026-10-10 17:43:05'),
(8, 'CSH-20261011-00000008', 1, 'SALE', 'IN', 8350.00, 11750.00, 20100.00, 'Cash sale INV-20261011-001', NULL, 'SALE', 36, 'fef88bba-48fa-443e-9f95-9193d8f683e5', 1, '2026-10-11 01:25:29'),
(9, 'CSH-20261011-00000009', 1, 'SALE', 'IN', 19500.00, 20100.00, 39600.00, 'Cash sale INV-20261011-002', NULL, 'SALE', 37, '27e65dc9-5dfc-47fa-a8dd-58f341a643a8', 1, '2026-10-11 01:30:04'),
(10, 'CSH-20261011-00000010', 1, 'SALE', 'IN', 4250.00, 39600.00, 43850.00, 'Cash sale INV-20261011-003', NULL, 'SALE', 38, 'bf4f3121-ad2c-413d-9af7-94291d3636ac', 1, '2026-10-11 01:33:44'),
(11, 'CSH-20261011-00000011', 1, 'SALE', 'IN', 250.00, 43850.00, 44100.00, 'Cash sale INV-20261011-004', NULL, 'SALE', 39, '11fc23cd-f1ef-4b5c-927d-09472e48aa6f', 1, '2026-10-11 01:33:50'),
(12, 'CSH-20261011-00000012', 1, 'SALE', 'IN', 600.00, 44100.00, 44700.00, 'Cash sale INV-20261011-005', NULL, 'SALE', 40, 'b25a3927-c2bb-4434-a069-bbe70a28b0d9', 1, '2026-10-11 01:33:57'),
(13, 'CSH-20261011-00000013', 1, 'SALE', 'IN', 3250.00, 44700.00, 47950.00, 'Cash sale INV-20261011-006', NULL, 'SALE', 41, '8e1492c0-88cd-4de9-a7a1-a6839da82810', 1, '2026-10-11 01:34:07'),
(14, 'CSH-20261011-00000014', 1, 'SALE', 'IN', 3250.00, 47950.00, 51200.00, 'Cash sale INV-20261011-007', NULL, 'SALE', 42, '365fddb1-d423-4934-9fc5-bd4e69b97898', 1, '2026-10-11 01:35:08'),
(15, 'CSH-20261011-00000015', 1, 'SALE', 'IN', 3250.00, 51200.00, 54450.00, 'Cash sale INV-20261011-008', NULL, 'SALE', 43, '08ea82f4-ff2f-4b09-b157-654d93aeb205', 1, '2026-10-11 01:35:44'),
(16, 'CSH-20261011-00000016', 1, 'SALE', 'IN', 250.00, 54450.00, 54700.00, 'Cash sale INV-20261011-009', NULL, 'SALE', 44, '419ca51f-0e88-447c-a6b9-93b6ff62bca2', 1, '2026-10-11 07:29:40'),
(17, 'CSH-20261011-00000017', 1, 'SALE', 'IN', 500.00, 54700.00, 55200.00, 'Cash sale INV-20261011-010', NULL, 'SALE', 45, '540d3c91-0524-4863-b4dd-546cced7f65a', 1, '2026-10-11 07:30:50'),
(18, 'CSH-20261011-00000018', 1, 'SALE', 'IN', 4000.00, 55200.00, 59200.00, 'Cash sale INV-20261011-011', NULL, 'SALE', 46, 'b7c4ee22-b8e8-4656-a3a6-07f63aece5ca', 1, '2026-10-11 09:39:18'),
(19, 'CSH-20261011-00000019', 1, 'CUSTOMER_PAYMENT', 'IN', 1500.00, 59200.00, 60700.00, 'Customer debt payment from Sho', NULL, 'PAYMENT', 66, NULL, 1, '2026-10-11 11:04:23'),
(20, 'CSH-20261011-00000020', 1, 'SALE', 'IN', 17800.00, 60700.00, 78500.00, 'Cash sale INV-20261011-012', NULL, 'SALE', 47, '314df3ee-634e-4a21-b9c2-786ee6c5d6d3', 1, '2026-10-11 12:15:41'),
(21, 'CSH-20261011-00000021', 1, 'SALE', 'IN', 11100.00, 78500.00, 89600.00, 'Cash sale INV-20261011-013', NULL, 'SALE', 48, 'd9cc13eb-2d11-4f04-b6d7-a65874b3b0eb', 1, '2026-10-11 12:16:27'),
(22, 'CSH-20261011-00000022', 1, 'SALE', 'IN', 54100.00, 89600.00, 143700.00, 'Cash sale INV-20261011-014', NULL, 'SALE', 49, '597e0c1c-dbec-4244-b43e-049fde1fa8cb', 1, '2026-10-11 12:17:08'),
(23, 'CSH-20261011-00000023', 1, 'SALE', 'IN', 13250.00, 143700.00, 156950.00, 'Cash sale INV-20261011-015', NULL, 'SALE', 50, '959c9c8e-3cb5-4605-a909-cca79cb08acd', 1, '2026-10-11 12:17:59'),
(24, 'CSH-20261011-00000024', 1, 'SALE', 'IN', 22300.00, 156950.00, 179250.00, 'Cash sale INV-20261011-016', NULL, 'SALE', 51, '156c9c25-afcd-40f6-9a61-89c95ff69e54', 1, '2026-10-11 12:25:58'),
(25, 'CSH-20261011-00000025', 1, 'SALE', 'IN', 11750.00, 179250.00, 191000.00, 'Cash sale INV-20261011-017', NULL, 'SALE', 52, 'eb134525-c781-4a19-aceb-6ee58a08d490', 1, '2026-10-11 14:20:47'),
(26, 'CSH-20261011-00000026', 1, 'SALE', 'IN', 7000.00, 191000.00, 198000.00, 'Cash sale INV-20261011-018', NULL, 'SALE', 53, '685c23df-c527-4e74-8ba3-7fd85e925267', 1, '2026-10-11 14:51:28'),
(27, 'CSH-20261011-00000027', 1, 'CUSTOMER_PAYMENT', 'IN', 250.00, 198000.00, 198250.00, 'Cash received for credit sale INV-20261011-019', NULL, 'PAYMENT', 74, NULL, 1, '2026-10-11 14:52:30'),
(28, 'CSH-20261011-00000028', 1, 'SALE', 'IN', 2250.00, 198250.00, 200500.00, 'Cash sale INV-20261011-020', NULL, 'SALE', 55, 'f781c961-9733-46e7-8ffe-2d4326409632', 1, '2026-10-11 15:01:16'),
(29, 'CSH-20261011-00000029', 1, 'CUSTOMER_PAYMENT', 'IN', 8.75, 200500.00, 200508.75, 'Cash received for credit sale INV-20261011-021', NULL, 'PAYMENT', 76, NULL, 1, '2026-10-11 16:14:57'),
(30, 'CSH-20261011-00000030', 1, 'CUSTOMER_PAYMENT', 'IN', 50000.00, 200508.75, 250508.75, 'Customer debt payment from دانا محەمەد ڕەشید', NULL, 'PAYMENT', 77, NULL, 1, '2026-10-11 16:23:45'),
(31, 'CSH-20261011-00000031', 1, 'CUSTOMER_PAYMENT', 'IN', 8841.25, 250508.75, 259350.00, 'Customer debt payment from Sho', NULL, 'PAYMENT', 78, NULL, 1, '2026-10-11 16:23:59'),
(32, 'CSH-20261011-00000032', 1, 'CUSTOMER_PAYMENT', 'IN', 2250.00, 259350.00, 261600.00, 'Customer debt payment from krr', NULL, 'PAYMENT', 79, NULL, 1, '2026-10-11 16:24:11'),
(33, 'CSH-20261011-00000033', 1, 'CUSTOMER_PAYMENT', 'IN', 43.00, 261600.00, 261643.00, 'Cash received for credit sale INV-20261011-022', NULL, 'PAYMENT', 80, NULL, 1, '2026-10-11 16:56:32'),
(34, 'CSH-20261011-00000034', 1, 'CUSTOMER_PAYMENT', 'IN', 9500.00, 261643.00, 271143.00, 'Cash received for credit sale INV-20261011-023', NULL, 'PAYMENT', 81, NULL, 1, '2026-10-11 16:57:20'),
(35, 'CSH-20261011-00000035', 1, 'CUSTOMER_PAYMENT', 'IN', 43057.00, 271143.00, 314200.00, 'Customer debt payment from pola', NULL, 'PAYMENT', 82, NULL, 1, '2026-10-11 16:57:43'),
(36, 'CSH-20261011-00000036', 1, 'SALE', 'IN', 500.00, 314200.00, 314700.00, 'Cash sale INV-20261011-024', NULL, 'SALE', 59, '80c62302-0a93-4635-8ac3-d05f923034cb', 1, '2026-10-11 20:00:49'),
(37, 'CSH-20261012-00000037', 1, 'SALE', 'IN', 5000.00, 314700.00, 319700.00, 'Cash sale INV-20261012-001', NULL, 'SALE', 60, 'd1dea4b8-14d1-4ac5-98df-6190be86abda', 1, '2026-10-12 07:43:58'),
(38, 'CSH-20261012-00000038', 1, 'SALE', 'IN', 13000.00, 319700.00, 332700.00, 'Cash sale INV-20261012-002', NULL, 'SALE', 61, 'fbea0312-a9e8-4945-8000-6300dfba782a', 1, '2026-10-12 07:49:05'),
(39, 'CSH-20261012-00000039', 1, 'SALE', 'IN', 5000.00, 332700.00, 337700.00, 'Cash sale INV-20261012-003', NULL, 'SALE', 62, '0a33491c-3eba-45f4-ad41-79c76af3f74c', 1, '2026-10-12 08:23:47'),
(40, 'CSH-20261012-00000040', 1, 'SALE', 'IN', 2500.00, 337700.00, 340200.00, 'Cash sale INV-20261012-004', NULL, 'SALE', 63, '666aa6aa-e5b0-419c-8cc0-0ac1b70f1518', 1, '2026-10-12 08:24:59'),
(41, 'CSH-20261013-00000041', 1, 'CUSTOMER_PAYMENT', 'IN', 12.00, 340200.00, 340212.00, 'Cash received for credit sale INV-20261013-001', NULL, 'PAYMENT', 88, NULL, 1, '2026-10-13 20:01:47');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_ku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_ar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Layers',
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `customers`;
CREATE TABLE IF NOT EXISTS `customers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `total_purchases` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total_paid` decimal(14,2) NOT NULL DEFAULT '0.00',
  `debt` decimal(14,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `customers_name_index` (`name`),
  KEY `customers_phone_index` (`phone`),
  KEY `customers_debt_index` (`debt`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `phone`, `address`, `notes`, `total_purchases`, `total_paid`, `debt`, `created_at`, `updated_at`) VALUES
(8, 'sho', '07504336815', 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:26:00', '2026-10-11 16:26:00'),
(9, 'hawzhin', '07503945934', 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:27:21', '2026-10-11 16:27:21'),
(10, 'pshraw najat', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:34:51', '2026-10-11 16:35:28'),
(11, 'hdd bxada', '07726439380', 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:38:44', '2026-10-11 16:38:44'),
(12, 'karzan bikap', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:39:16', '2026-10-11 16:39:16'),
(13, 'daiki peshraw najat', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:43:59', '2026-10-11 16:43:59'),
(14, 'nur', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:46:16', '2026-10-11 16:46:16'),
(15, 'azhin jegar', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:48:47', '2026-10-11 16:48:47'),
(16, 'havin plkm', NULL, NULL, NULL, 0.00, 0.00, 0.00, '2026-10-11 16:51:18', '2026-10-11 16:51:18'),
(17, 'xezani bkr', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:51:45', '2026-10-11 16:51:45'),
(18, 'ahmmed sabir', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:52:12', '2026-10-11 16:52:12'),
(20, 'buke pare', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:53:57', '2026-10-11 16:53:57'),
(21, 'daiki hawkar', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:54:24', '2026-10-11 16:54:24'),
(22, 'mam fuad turkman', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:55:00', '2026-10-11 16:55:00'),
(23, 'pola', NULL, 'erbil', NULL, 0.00, 0.00, 0.00, '2026-10-11 16:58:24', '2026-10-11 16:58:24'),
(24, 'کارزان', 'مهدی', 'کۆیە', NULL, 2500.00, 12.00, 2488.00, '2026-10-13 17:01:47', '2026-10-13 17:01:47');

-- --------------------------------------------------------

--
-- Table structure for table `customer_debt_entries`
--

DROP TABLE IF EXISTS `customer_debt_entries`;
CREATE TABLE IF NOT EXISTS `customer_debt_entries` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `debt_date` date NOT NULL,
  `due_date` date DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `idempotency_key` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customer_debt_entries_idempotency_key_unique` (`idempotency_key`),
  KEY `customer_debt_entries_user_id_foreign` (`user_id`),
  KEY `customer_debt_entries_customer_id_debt_date_index` (`customer_id`,`debt_date`),
  KEY `customer_debt_entries_due_date_index` (`due_date`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(14,2) NOT NULL,
  `date` date NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `user_id` bigint UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `idempotency_key` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `expenses_idempotency_key_unique` (`idempotency_key`),
  KEY `expenses_user_id_foreign` (`user_id`),
  KEY `expenses_category_id_index` (`category_id`),
  KEY `expenses_date_index` (`date`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `category_id`, `amount`, `date`, `description`, `user_id`, `created_at`, `updated_at`, `idempotency_key`) VALUES
(1, 1, 25000.00, '2026-10-07', 'Seeded sample electricity expense', 1, '2026-10-07 19:38:38', '2026-10-07 19:38:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

DROP TABLE IF EXISTS `expense_categories`;
CREATE TABLE IF NOT EXISTS `expense_categories` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_ku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_ar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(24, '2026_10_09_235500_add_custom_user_permissions', 1),
(26, '2026_10_13_000001_create_customer_debt_entries_table', 2);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `payment_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_id` bigint UNSIGNED DEFAULT NULL,
  `party_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `party_id` bigint UNSIGNED DEFAULT NULL,
  `amount` decimal(14,2) NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH',
  `user_id` bigint UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idempotency_key` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payments_idempotency_key_unique` (`idempotency_key`),
  KEY `payments_user_id_foreign` (`user_id`),
  KEY `payments_payment_type_index` (`payment_type`),
  KEY `payments_party_type_index` (`party_type`),
  KEY `payments_party_id_index` (`party_id`),
  KEY `payments_created_at_index` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(55, 'SALE_PAYMENT', 36, 'CUSTOMER', NULL, 8350.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-001', '2026-10-11 01:25:29', NULL),
(56, 'SALE_PAYMENT', 37, 'CUSTOMER', NULL, 19500.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-002', '2026-10-11 01:30:04', NULL),
(57, 'SALE_PAYMENT', 38, 'CUSTOMER', NULL, 4250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-003', '2026-10-11 01:33:44', NULL),
(58, 'SALE_PAYMENT', 39, 'CUSTOMER', NULL, 250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-004', '2026-10-11 01:33:50', NULL),
(59, 'SALE_PAYMENT', 40, 'CUSTOMER', NULL, 600.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-005', '2026-10-11 01:33:57', NULL),
(60, 'SALE_PAYMENT', 41, 'CUSTOMER', NULL, 3250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-006', '2026-10-11 01:34:07', NULL),
(61, 'SALE_PAYMENT', 42, 'CUSTOMER', NULL, 3250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-007', '2026-10-11 01:35:08', NULL),
(62, 'SALE_PAYMENT', 43, 'CUSTOMER', NULL, 3250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-008', '2026-10-11 01:35:44', NULL),
(63, 'SALE_PAYMENT', 44, 'CUSTOMER', NULL, 250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-009', '2026-10-11 07:29:40', NULL),
(64, 'SALE_PAYMENT', 45, 'CUSTOMER', NULL, 500.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-010', '2026-10-11 07:30:50', NULL),
(65, 'SALE_PAYMENT', 46, 'CUSTOMER', NULL, 4000.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-011', '2026-10-11 09:39:18', NULL),
(66, 'DEBT_PAYMENT', 4, 'CUSTOMER', 4, 1500.00, 'CASH', 1, 'دانەوەی قەرزی کڕیار', '2026-10-11 11:04:23', 'b7f1166a-ccb2-42e3-9cfe-6e8f8023032c'),
(67, 'SALE_PAYMENT', 47, 'CUSTOMER', NULL, 17800.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-012', '2026-10-11 12:15:41', NULL),
(68, 'SALE_PAYMENT', 48, 'CUSTOMER', NULL, 11100.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-013', '2026-10-11 12:16:27', NULL),
(69, 'SALE_PAYMENT', 49, 'CUSTOMER', NULL, 54100.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-014', '2026-10-11 12:17:08', NULL),
(70, 'SALE_PAYMENT', 50, 'CUSTOMER', NULL, 13250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-015', '2026-10-11 12:17:59', NULL),
(71, 'SALE_PAYMENT', 51, 'CUSTOMER', NULL, 22300.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-016', '2026-10-11 12:25:58', NULL),
(72, 'SALE_PAYMENT', 52, 'CUSTOMER', NULL, 11750.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-017', '2026-10-11 14:20:47', NULL),
(73, 'SALE_PAYMENT', 53, 'CUSTOMER', NULL, 7000.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-018', '2026-10-11 14:51:28', NULL),
(74, 'SALE_PAYMENT', 54, 'CUSTOMER', 7, 250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-019', '2026-10-11 14:52:30', NULL),
(75, 'SALE_PAYMENT', 55, 'CUSTOMER', NULL, 2250.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-020', '2026-10-11 15:01:16', NULL),
(76, 'SALE_PAYMENT', 56, 'CUSTOMER', 4, 8.75, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-021', '2026-10-11 16:14:57', NULL),
(77, 'DEBT_PAYMENT', 1, 'CUSTOMER', 1, 50000.00, 'CASH', 1, 'دانەوەی قەرزی کڕیار', '2026-10-11 16:23:45', 'ec166d84-b4e0-4620-a6fc-6d34889a0328'),
(78, 'DEBT_PAYMENT', 4, 'CUSTOMER', 4, 8841.25, 'CASH', 1, 'دانەوەی قەرزی کڕیار', '2026-10-11 16:23:59', 'eacb2108-7afc-46f1-9274-ab7912ec4f05'),
(79, 'DEBT_PAYMENT', 7, 'CUSTOMER', 7, 2250.00, 'CASH', 1, 'دانەوەی قەرزی کڕیار', '2026-10-11 16:24:11', '37ec8621-fc6a-4067-b27b-44c231522942'),
(80, 'SALE_PAYMENT', 57, 'CUSTOMER', 19, 43.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-022', '2026-10-11 16:56:32', NULL),
(81, 'SALE_PAYMENT', 58, 'CUSTOMER', 19, 9500.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-023', '2026-10-11 16:57:20', NULL),
(82, 'DEBT_PAYMENT', 19, 'CUSTOMER', 19, 43057.00, 'CASH', 1, 'دانەوەی قەرزی کڕیار', '2026-10-11 16:57:43', '41248ffd-0fd9-403e-858d-a19ee318f40c'),
(83, 'SALE_PAYMENT', 59, 'CUSTOMER', NULL, 500.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261011-024', '2026-10-11 20:00:49', NULL),
(84, 'SALE_PAYMENT', 60, 'CUSTOMER', NULL, 5000.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261012-001', '2026-10-12 07:43:58', NULL),
(85, 'SALE_PAYMENT', 61, 'CUSTOMER', NULL, 13000.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261012-002', '2026-10-12 07:49:05', NULL),
(86, 'SALE_PAYMENT', 62, 'CUSTOMER', NULL, 5000.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261012-003', '2026-10-12 08:23:47', NULL),
(87, 'SALE_PAYMENT', 63, 'CUSTOMER', NULL, 2500.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261012-004', '2026-10-12 08:24:59', NULL),
(88, 'SALE_PAYMENT', 64, 'CUSTOMER', 24, 12.00, 'CASH', 1, 'پارەدان بۆ وەسڵی INV-20261013-001', '2026-10-13 17:01:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `module` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permissions_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', 'a906d64726a8ca1121ee5fe71641fdda53262d370e70ab0dbb6bfa88b13416ba', '[\"*\"]', '2026-10-10 15:56:40', NULL, '2026-10-09 19:48:31', '2026-10-10 15:56:40'),
(2, 'App\\Models\\User', 1, 'auth_token', '4c85f2337b8d1d99a55765e4454cb47e22887df9b182af0fe38807057e41712e', '[\"*\"]', '2026-10-13 11:02:49', NULL, '2026-10-10 22:39:26', '2026-10-13 11:02:49'),
(4, 'App\\Models\\User', 1, 'auth_token', '234bef6d6d2b2db4af37a7b16f7ccac2cfdccca0ab9fde11b44ec3418e97ca20', '[\"*\"]', '2026-10-12 20:34:31', NULL, '2026-10-10 22:52:56', '2026-10-12 20:34:31'),
(5, 'App\\Models\\User', 1, 'auth_token', '25818c6b07762de5b1c429e388a70c66aff45e544323d73d28c1fe7986313070', '[\"*\"]', '2026-10-11 01:25:15', NULL, '2026-10-10 23:06:43', '2026-10-11 01:25:15'),
(7, 'App\\Models\\User', 1, 'auth_token', 'ca6d573a1b5a3115c691ce662fffbbb685713340cf6f1b8dedcbf248be93774f', '[\"*\"]', '2026-10-11 01:35:53', NULL, '2026-10-11 01:24:45', '2026-10-11 01:35:53'),
(8, 'App\\Models\\User', 1, 'auth_token', '6a4e1b017b8486c5ff9c0225a9407e454b4a509b060e7836890b31df3e4dae8d', '[\"*\"]', '2026-10-11 01:35:45', NULL, '2026-10-11 01:34:54', '2026-10-11 01:35:45'),
(9, 'App\\Models\\User', 1, 'auth_token', 'badfaf1da8b987f893e32a90ef6d9877dd15cff7dd40443729f39d7e586e29f6', '[\"*\"]', '2026-10-11 03:37:27', NULL, '2026-10-11 03:37:05', '2026-10-11 03:37:27'),
(10, 'App\\Models\\User', 1, 'auth_token', 'e0575048f1fe9023ec717b0d522ca1d50605bd2a607c4261ccc5750e317dbf01', '[\"*\"]', '2026-10-11 08:32:32', NULL, '2026-10-11 08:09:13', '2026-10-11 08:32:32'),
(11, 'App\\Models\\User', 1, 'auth_token', '26c08a66ca40e1b3b84c96fe353e55477e7da27c57a29096aedebcb672544ac2', '[\"*\"]', '2026-10-12 00:51:42', NULL, '2026-10-11 08:40:41', '2026-10-12 00:51:42'),
(13, 'App\\Models\\User', 1, 'auth_token', 'd003b22b7cd025effabd5341d1b1ee3f5ce1736e0e9de93f70baab1b5cafe2e1', '[\"*\"]', '2026-10-11 09:39:18', NULL, '2026-10-11 09:35:45', '2026-10-11 09:39:18'),
(14, 'App\\Models\\User', 1, 'auth_token', '58a2f5319bd7d738721137152d697e2a688750cce42922de01632a28106b5d19', '[\"*\"]', '2026-10-11 20:06:01', NULL, '2026-10-11 10:21:24', '2026-10-11 20:06:01'),
(15, 'App\\Models\\User', 1, 'auth_token', '97782cd60fdc5c407c48e2966eb0eda316f29719f3b9304ab85e32f3991f3bb7', '[\"*\"]', '2026-10-11 15:09:29', NULL, '2026-10-11 14:47:33', '2026-10-11 15:09:29'),
(16, 'App\\Models\\User', 1, 'auth_token', '74f390d5c3667065e91eb959a19febcecf07186cf20b0e15cb6d78bf667d2f15', '[\"*\"]', '2026-10-12 19:56:37', NULL, '2026-10-11 14:48:31', '2026-10-12 19:56:37'),
(17, 'App\\Models\\User', 1, 'auth_token', 'f669958726a46cf4e369062cec3741b6ce2b92ab52d33ee111de7e3baea5005a', '[\"*\"]', '2026-10-12 14:41:52', NULL, '2026-10-11 18:16:07', '2026-10-12 14:41:52'),
(18, 'App\\Models\\User', 1, 'auth_token', '21e959848497de5fb551935fa25087e3c1cbbb2aa05fb8b209cb11a176184d2b', '[\"*\"]', '2026-10-11 22:03:05', NULL, '2026-10-11 19:13:01', '2026-10-11 22:03:05'),
(19, 'App\\Models\\User', 1, 'auth_token', '4e384a7035ab03ea025848b9877471ee49de61d6d734bb83c2221f058ae19b7a', '[\"*\"]', '2026-10-11 19:31:50', NULL, '2026-10-11 19:31:43', '2026-10-11 19:31:50'),
(20, 'App\\Models\\User', 1, 'auth_token', '71f69e047ec6ab0fe5b2f8a6fd86b333301180c48b90b1b32ba8098cc0518e94', '[\"*\"]', '2026-10-12 06:29:51', NULL, '2026-10-12 00:52:13', '2026-10-12 06:29:51'),
(21, 'App\\Models\\User', 1, 'auth_token', '1afdc9af0b0f282243f9b8b323c2e6750c7a8ba70d92ac97c2ba239378aafe5a', '[\"*\"]', '2026-10-12 09:05:28', NULL, '2026-10-12 06:17:53', '2026-10-12 09:05:28'),
(22, 'App\\Models\\User', 1, 'auth_token', 'da3f6fff696b09b16462ac1fb7bbf7cff411e13dee8c24059678ec868e21b774', '[\"*\"]', '2026-10-12 19:08:13', NULL, '2026-10-12 12:09:56', '2026-10-12 19:08:13'),
(26, 'App\\Models\\User', 1, 'auth_token', '259f0c010f7818f1aa7e0458cb446e1a44f5d308ce0d54f5226a4a01e6412db4', '[\"*\"]', '2026-10-13 09:07:14', NULL, '2026-10-13 08:54:55', '2026-10-13 09:07:14'),
(27, 'App\\Models\\User', 1, 'auth_token', '58f73ccc49045b9c3a1657efb425eb31720cf9a806015e3b758dfef978c26250', '[\"*\"]', '2026-10-13 17:36:41', NULL, '2026-10-13 09:07:42', '2026-10-13 17:36:41'),
(28, 'App\\Models\\User', 1, 'auth_token', 'f939fc89445232227231b6e56d45f58bb29fb77a2a470f6cc4b6f4f7cf718f09', '[\"*\"]', '2026-10-13 17:53:21', NULL, '2026-10-13 17:44:21', '2026-10-13 17:53:21');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `barcode` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_ku` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `unit_id` bigint UNSIGNED NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `selling_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `wholesale_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `quantity` decimal(12,2) NOT NULL DEFAULT '0.00',
  `min_stock` decimal(12,2) NOT NULL DEFAULT '5.00',
  `expiry_date` date DEFAULT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_barcode_unique` (`barcode`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `products_unit_id_foreign` (`unit_id`),
  KEY `products_barcode_index` (`barcode`),
  KEY `products_sku_index` (`sku`),
  KEY `products_category_id_index` (`category_id`),
  KEY `products_quantity_index` (`quantity`),
  KEY `products_expiry_date_index` (`expiry_date`),
  KEY `products_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `barcode`, `sku`, `name_ku`, `category_id`, `unit_id`, `purchase_price`, `selling_price`, `wholesale_price`, `quantity`, `min_stock`, `expiry_date`, `image`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, '628100701001', 'PROD-001', 'شیری تەڕی مەراعی ١ لیتر', 1, 5, 1250.00, 1750.00, 1500.00, 48.00, 10.00, '2026-11-20', NULL, 'شیری فرێشی پڕ چەوری', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(2, '628100701002', 'PROD-002', 'پەنیری شوشەی کڕافت ٥٠٠ گرام', 1, 1, 3500.00, 4750.00, 4200.00, 23.00, 8.00, '2027-02-15', NULL, 'پەنیری کریستالی کڕافت', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(3, '628100701003', 'PROD-003', 'ماستی خۆماڵی هەولێر ١ کیلۆ', 1, 2, 1500.00, 2250.00, 1900.00, 17.00, 5.00, '2026-10-15', NULL, 'ماستی تەواو چەوری کوردی', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(4, '869050401111', 'PROD-004', 'برنجی کوردی بەسمەتی مەحمود ٥ کیلۆ', 2, 3, 9500.00, 12500.00, 11000.00, 35.00, 8.00, '2028-06-30', NULL, 'برنجی نایابی دانە درێژ', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-09 19:38:38'),
(5, '869050401112', 'PROD-005', 'چای ئەحمەد کوردی ٤٥٠ گرام', 2, 3, 3750.00, 5000.00, 4400.00, 57.00, 15.00, '2027-12-31', NULL, 'چای کوردی بۆنخۆش و خەست', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(6, '628100701006', 'PROD-006', 'هێلکەی مریشک ٣٠ دانە', 1, 3, 6500.00, 8000.00, 7200.00, 20.00, 6.00, '2026-11-15', NULL, 'هێلکەی تازەی ناوخۆیی', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(7, '628100701007', 'PROD-007', 'مۆز ١ کیلۆ', 3, 2, 1000.00, 1500.00, 1250.00, 42.00, 10.00, '2026-10-20', NULL, 'مۆزی تازەی هاوردە', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(8, '628100701008', 'PROD-008', 'ڕۆنی خواردن ١ لیتر', 2, 5, 1750.00, 2500.00, 2100.00, 54.00, 12.00, '2027-08-01', NULL, 'ڕۆنی پاکی خواردن', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(9, '628100701009', 'PROD-009', 'ئاردی گەنم ١ کیلۆ', 2, 3, 750.00, 1100.00, 900.00, 69.00, 15.00, '2027-06-01', NULL, 'ئاردی گەنمی ورد', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 12:17:08'),
(10, '628100701010', 'PROD-010', 'بیسکیتی چۆکڵێت ٢٠٠ گرام', 4, 3, 800.00, 1250.00, 1000.00, 36.00, 8.00, '2027-04-01', NULL, 'بیسکیتی پڕکراو بە چۆکڵێت', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(11, '628100701011', 'PROD-011', 'ئاوی خواردنەوە ١.٥ لیتر', 5, 5, 250.00, 500.00, 350.00, 97.00, 20.00, '2028-06-01', NULL, 'ئاوی پاک و پاڵاوتراو', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(12, '544900000099', 'PROD-012', 'کۆکاکۆلا قتووی ٣٣٠ مل', 5, 1, 400.00, 600.00, 480.00, 118.00, 30.00, '2027-09-01', NULL, 'خواردنەوەی گازی سارد', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:56:32'),
(13, '628100701013', 'PROD-013', 'شەربەتی پرتەقاڵ ١ لیتر', 5, 5, 1250.00, 2000.00, 1650.00, 32.00, 8.00, '2027-03-01', NULL, 'شەربەتی میوەی پرتەقاڵ', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:57:20'),
(14, '869053000001', 'PROD-014', 'مایع زەرفی فەێری لیمۆ ٨٠٠ مل', 6, 1, 2200.00, 3000.00, 2600.00, 27.00, 8.00, '2028-01-01', NULL, 'پاککەرەوەی بەهێزی دەفری چەور', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:14:57'),
(15, '628100701015', 'PROD-015', 'شامپۆی قژ ٤٠٠ مل', 6, 1, 2500.00, 3500.00, 3000.00, 17.00, 5.00, '2029-01-01', NULL, 'شامپۆی پاراستنی قژ', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 14:20:47'),
(16, '628100701016', 'PROD-016', 'نانی سپی', 7, 1, 500.00, 750.00, 600.00, 22.00, 5.00, '2026-10-10', NULL, 'نانی تازەی ڕۆژانە', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 12:25:58'),
(17, '628100701017', 'PROD-017', 'نۆکی سوور ١ کیلۆ', 2, 2, 1400.00, 2000.00, 1700.00, 21.00, 7.00, '2028-03-01', NULL, 'نۆکی سووری پاککراو', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:57:20'),
(18, '628100701018', 'PROD-018', 'تەمایتەی تازە ١ کیلۆ', 3, 2, 600.00, 1000.00, 800.00, 15.50, 6.00, '2026-10-15', NULL, 'تەمایتەی تازەی ناوخۆیی', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 20:00:49'),
(19, '628100701019', 'PROD-019', 'پاککەرەوەی جلی ١ کیلۆ', 6, 3, 1800.00, 2600.00, 2200.00, 10.00, 5.00, NULL, NULL, 'پاککەرەوەی جل بۆ بەکارهێنانی ڕۆژانە', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:57:20'),
(20, '628100701020', 'PROD-020', 'قاوەی چۆکڵێت ١٠٠ گرام', 4, 1, 900.00, 1400.00, 1150.00, 18.00, 8.00, '2027-12-01', 'products/ymNL1eoDNKPl3wmG5E0NWoarQxHEuj8JOubHYXQd.jpg', 'قاوەی چۆکڵێتی شیری', 'ACTIVE', '2026-10-09 19:38:38', '2026-10-11 16:57:20'),
(21, '5709730406254', 'SKU-21', 'جۆ', 5, 1, 1718.00, 2250.00, 41250.00, 95.00, 2.00, '2026-10-11', 'products/dRJxhTVagqNVa2sTEzfnOsisjqGDz13vCwGpIVeF.png', NULL, 'ACTIVE', '2026-10-10 22:41:30', '2026-10-13 17:01:47'),
(22, '9551007521773', 'SKU-22', 'ئاسان', 5, 1, 200.00, 250.00, 0.00, 20.00, 12.00, NULL, 'products/PkaWG4siPwNSGT7aIWuQzPdF9ek3idkDRTGofTM0.jpg', NULL, 'INACTIVE', '2026-10-10 23:08:28', '2026-10-12 07:52:12'),
(23, '5641725442574', 'SKU-23', 'اوە خۆشەکە', 5, 1, 200.00, 250.00, 225.00, 74.00, 10.00, '2026-10-16', NULL, 'Ahhh waish', 'INACTIVE', '2026-10-11 07:28:55', '2026-10-12 07:52:22'),
(24, '8690504119579', 'SKU-24', 'deluxe', 1, 1, 229.00, 250.00, 5500.00, 40.00, 0.00, '2026-11-10', NULL, NULL, 'ACTIVE', '2026-10-11 10:15:08', '2026-10-11 16:57:20'),
(25, '6253805190290', 'SKU-25', 'msk', 4, 1, 208.08, 250.00, 10.00, 48.00, 0.00, '0001-01-01', NULL, NULL, 'INACTIVE', '2026-10-11 18:27:49', '2026-10-12 07:52:09'),
(26, '6260463800225', 'SKU-26', 'loura', 4, 1, 3250.00, 4000.00, 39000.00, 9.00, 0.00, '0001-02-01', NULL, NULL, 'ACTIVE', '2026-10-11 18:29:44', '2026-10-12 07:49:05'),
(27, '8699965895909', 'SKU-27', 'alen', 2, 1, 750.00, 1000.00, 9000.00, 18.00, 0.00, '2027-02-06', NULL, NULL, 'INACTIVE', '2026-10-12 07:36:49', '2026-10-12 07:52:06'),
(28, '9005182013566', 'SKU-28', 'loura', 2, 1, 3250.00, 4500.00, 39000.00, 24.00, 0.00, '2027-02-05', NULL, NULL, 'INACTIVE', '2026-10-12 07:49:31', '2026-10-12 07:52:03'),
(29, '5900820011468', 'SKU-29', 'iced coffee', 2, 1, 1750.00, 2000.00, 17500.00, 10.00, 0.00, '2007-07-05', NULL, NULL, 'ACTIVE', '2026-10-12 07:52:42', '2026-10-12 07:52:42'),
(30, '8690526019383', 'SKU-30', 'taciuaty', 2, 1, 2000.00, 2500.00, 24000.00, 12.00, 0.00, '2026-11-15', NULL, NULL, 'INACTIVE', '2026-10-12 07:56:51', '2026-10-12 07:59:19'),
(31, '8345654359626', 'SKU-31', 'aw', 5, 1, 200.00, 250.00, 250.00, 89.00, 0.00, '2027-09-25', NULL, NULL, 'ACTIVE', '2026-10-12 08:08:27', '2026-10-13 17:01:47'),
(32, '8690545470301', 'SKU-32', 'beking powder', 2, 1, 69.45, 83.34, 2500.00, 36.00, 0.00, '2028-07-07', NULL, NULL, 'ACTIVE', '2026-10-12 08:12:02', '2026-10-12 08:12:02'),
(33, '2042883620997', 'SKU-33', 'کارزان', 5, 2, 2000.00, 30000.00, 30000.00, 3.00, 2.00, '2026-10-06', NULL, '22', 'ACTIVE', '2026-10-13 08:57:48', '2026-10-13 08:57:48');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

DROP TABLE IF EXISTS `purchases`;
CREATE TABLE IF NOT EXISTS `purchases` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `total` decimal(14,2) NOT NULL,
  `paid_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `remaining_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `payment_status` enum('PAID','PARTIAL','DUE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAID',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchases_invoice_number_unique` (`invoice_number`),
  KEY `purchases_user_id_foreign` (`user_id`),
  KEY `purchases_invoice_number_index` (`invoice_number`),
  KEY `purchases_supplier_id_index` (`supplier_id`),
  KEY `purchases_created_at_index` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

DROP TABLE IF EXISTS `purchase_items`;
CREATE TABLE IF NOT EXISTS `purchase_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `purchase_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL,
  `previous_purchase_price` decimal(12,2) DEFAULT NULL,
  `total` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `purchase_items_purchase_id_index` (`purchase_id`),
  KEY `purchase_items_product_id_index` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

DROP TABLE IF EXISTS `returns`;
CREATE TABLE IF NOT EXISTS `returns` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_id` bigint UNSIGNED NOT NULL,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `total_refund` decimal(14,2) NOT NULL,
  `reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `idempotency_key` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_hash` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `returns_idempotency_key_unique` (`idempotency_key`),
  KEY `returns_customer_id_foreign` (`customer_id`),
  KEY `returns_user_id_foreign` (`user_id`),
  KEY `returns_sale_id_index` (`sale_id`),
  KEY `returns_invoice_number_index` (`invoice_number`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `returns`
--

INSERT INTO `returns` (`id`, `sale_id`, `invoice_number`, `customer_id`, `user_id`, `total_refund`, `reason`, `created_at`, `updated_at`, `idempotency_key`, `request_hash`) VALUES
(1, 1, 'DEMO-SALE-0001', NULL, 1, 1750.00, 'Seeded sample return', '2026-10-08 19:38:38', '2026-10-08 19:38:38', NULL, NULL),
(2, 1, 'DEMO-SALE-0001', NULL, 1, 1750.00, 'تێکچوە', '2026-10-10 14:32:38', '2026-10-10 14:32:38', '4880300c-8bdc-435f-bea5-59ede1835cc4', 'e719e00c73e89739adea2c607339d9e2a3751bce1c5ff625716becb585704aaf'),
(3, 1, 'DEMO-SALE-0001', NULL, 1, 5000.00, 'گێڕانەوەی کاڵا', '2026-10-10 14:33:38', '2026-10-10 14:33:38', '53bb5033-36b9-4cc0-9b60-7696456b14fc', 'd202b054b4d937529bce4f9ea043c64b1de0544fc7d238eec81e537d849cea1d'),
(4, 35, 'INV-20261010-003', NULL, 1, 1400.00, 'ssss', '2026-10-10 14:43:05', '2026-10-10 14:43:05', '81101e5b-1257-4330-a718-c562c06a28bb', '7e63d2605d8b0d8368421bbac76adcaf5b037bb8fc57e5fcbe9bb4bf6b682c4a');

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

DROP TABLE IF EXISTS `return_items`;
CREATE TABLE IF NOT EXISTS `return_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `return_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `total` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `return_items_return_id_index` (`return_id`),
  KEY `return_items_product_id_index` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name_ku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name_en` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name_ar` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE IF NOT EXISTS `role_permissions` (
  `role_id` bigint UNSIGNED NOT NULL,
  `permission_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`,`permission_id`),
  KEY `role_permissions_permission_id_foreign` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`role_id`, `permission_id`) VALUES
(1, 1),
(2, 1),
(1, 2),
(2, 2),
(3, 2),
(1, 3),
(2, 3),
(3, 3),
(1, 4),
(2, 4),
(1, 5),
(2, 5),
(3, 5),
(1, 6),
(2, 6),
(1, 7),
(2, 7),
(3, 7),
(1, 8),
(2, 8),
(1, 9),
(2, 9),
(1, 10),
(2, 10),
(1, 11),
(2, 11),
(1, 12),
(2, 12),
(1, 13),
(2, 13),
(1, 14),
(2, 14),
(1, 15),
(2, 15),
(1, 16),
(2, 16),
(3, 16),
(1, 17),
(2, 17),
(1, 18),
(2, 18),
(1, 19),
(2, 19),
(1, 20),
(2, 20),
(1, 21),
(2, 21),
(1, 22),
(2, 22),
(3, 22),
(1, 23),
(2, 23),
(3, 23),
(1, 24),
(2, 24),
(1, 25),
(1, 26),
(2, 26),
(3, 26),
(1, 27),
(1, 28);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
CREATE TABLE IF NOT EXISTS `sales` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `customer_id` bigint UNSIGNED DEFAULT NULL,
  `subtotal` decimal(14,2) NOT NULL,
  `discount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `tax` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total` decimal(14,2) NOT NULL,
  `cost_of_goods` decimal(14,2) NOT NULL DEFAULT '0.00',
  `profit` decimal(14,2) NOT NULL DEFAULT '0.00',
  `cash_received` decimal(14,2) NOT NULL DEFAULT '0.00',
  `change_amount` decimal(14,2) NOT NULL DEFAULT '0.00',
  `payment_method` enum('CASH','CARD','CREDIT') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CASH',
  `payment_status` enum('PAID','PARTIAL','DUE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAID',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `idempotency_key` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sales_invoice_number_unique` (`invoice_number`),
  UNIQUE KEY `sales_idempotency_key_unique` (`idempotency_key`),
  KEY `sales_invoice_number_index` (`invoice_number`),
  KEY `sales_created_at_index` (`created_at`),
  KEY `sales_user_id_index` (`user_id`),
  KEY `sales_customer_id_index` (`customer_id`),
  KEY `sales_payment_method_index` (`payment_method`),
  KEY `sales_payment_status_index` (`payment_status`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `invoice_number`, `user_id`, `customer_id`, `subtotal`, `discount`, `tax`, `total`, `cost_of_goods`, `profit`, `cash_received`, `change_amount`, `payment_method`, `payment_status`, `notes`, `created_at`, `updated_at`, `idempotency_key`) VALUES
(1, 'DEMO-SALE-0001', 1, NULL, 8500.00, 0.00, 0.00, 8500.00, 6250.00, 2250.00, 8500.00, 0.00, 'CASH', 'PAID', 'Seeded sample sale', '2026-10-06 19:38:38', '2026-10-06 19:38:38', NULL),
(32, 'INV-20261009-001', 1, NULL, 14000.00, 0.00, 0.00, 14000.00, 9200.00, 4800.00, 14000.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-09 20:37:47', '2026-10-09 20:37:47', 'f831620f-6074-4229-95e6-3abfd31b042e'),
(33, 'INV-20261010-001', 1, NULL, 5000.00, 1000.00, 0.00, 4000.00, 3300.00, 700.00, 4000.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-10 14:22:08', '2026-10-10 14:22:08', '9b6f0103-1904-4089-a52b-f21bd6e529b3'),
(34, 'INV-20261010-002', 1, NULL, 2800.00, 800.00, 0.00, 2000.00, 1800.00, 200.00, 500.00, 0.00, 'CREDIT', 'PARTIAL', NULL, '2026-10-10 14:24:32', '2026-10-10 14:24:32', '43f8a059-6497-4923-b704-57fda037db2f'),
(35, 'INV-20261010-003', 1, NULL, 1400.00, 0.00, 0.00, 1400.00, 900.00, 500.00, 1400.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-10 14:42:19', '2026-10-10 14:42:19', 'd5f1c771-18fa-4b81-ac9c-84e4b3b65f35'),
(36, 'INV-20261011-001', 1, NULL, 8350.00, 0.00, 0.00, 8350.00, 5300.00, 3050.00, 8350.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 01:25:29', '2026-10-11 01:25:29', 'fef88bba-48fa-443e-9f95-9193d8f683e5'),
(37, 'INV-20261011-002', 1, NULL, 19500.00, 0.00, 0.00, 19500.00, 13350.00, 6150.00, 19500.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 01:30:04', '2026-10-11 01:30:04', '27e65dc9-5dfc-47fa-a8dd-58f341a643a8'),
(38, 'INV-20261011-003', 1, NULL, 4250.00, 0.00, 0.00, 4250.00, 3000.00, 1250.00, 4250.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 01:33:44', '2026-10-11 01:33:44', 'bf4f3121-ad2c-413d-9af7-94291d3636ac'),
(39, 'INV-20261011-004', 1, NULL, 250.00, 0.00, 0.00, 250.00, 200.00, 50.00, 250.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 01:33:50', '2026-10-11 01:33:50', '11fc23cd-f1ef-4b5c-927d-09472e48aa6f'),
(40, 'INV-20261011-005', 1, NULL, 600.00, 0.00, 0.00, 600.00, 1000.00, -400.00, 600.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 01:33:57', '2026-10-11 01:33:57', 'b25a3927-c2bb-4434-a069-bbe70a28b0d9'),
(41, 'INV-20261011-006', 1, NULL, 3250.00, 0.00, 0.00, 3250.00, 2200.00, 1050.00, 3250.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 01:34:07', '2026-10-11 01:34:07', '8e1492c0-88cd-4de9-a7a1-a6839da82810'),
(42, 'INV-20261011-007', 1, NULL, 3250.00, 0.00, 0.00, 3250.00, 2200.00, 1050.00, 3250.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 01:35:08', '2026-10-11 01:35:08', '365fddb1-d423-4934-9fc5-bd4e69b97898'),
(43, 'INV-20261011-008', 1, NULL, 3250.00, 0.00, 0.00, 3250.00, 2200.00, 1050.00, 3250.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 01:35:44', '2026-10-11 01:35:44', '08ea82f4-ff2f-4b09-b157-654d93aeb205'),
(44, 'INV-20261011-009', 1, NULL, 250.00, 0.00, 0.00, 250.00, 200.00, 50.00, 250.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 07:29:40', '2026-10-11 07:29:40', '419ca51f-0e88-447c-a6b9-93b6ff62bca2'),
(45, 'INV-20261011-010', 1, NULL, 500.00, 0.00, 0.00, 500.00, 400.00, 100.00, 500.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 07:30:50', '2026-10-11 07:30:50', '540d3c91-0524-4863-b4dd-546cced7f65a'),
(46, 'INV-20261011-011', 1, NULL, 4000.00, 0.00, 0.00, 4000.00, 3200.00, 800.00, 25000.00, 21000.00, 'CASH', 'PAID', NULL, '2026-10-11 09:39:18', '2026-10-11 09:39:18', 'b7c4ee22-b8e8-4656-a3a6-07f63aece5ca'),
(47, 'INV-20261011-012', 1, NULL, 17800.00, 0.00, 0.00, 17800.00, 12500.00, 5300.00, 17800.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 12:15:41', '2026-10-11 12:15:41', '314df3ee-634e-4a21-b9c2-786ee6c5d6d3'),
(48, 'INV-20261011-013', 1, NULL, 11100.00, 0.00, 0.00, 11100.00, 7918.00, 3182.00, 11100.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 12:16:27', '2026-10-11 12:16:27', 'd9cc13eb-2d11-4f04-b6d7-a65874b3b0eb'),
(49, 'INV-20261011-014', 1, NULL, 54100.00, 0.00, 0.00, 54100.00, 41779.00, 12321.00, 54100.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 12:17:08', '2026-10-11 12:17:08', '597e0c1c-dbec-4244-b43e-049fde1fa8cb'),
(50, 'INV-20261011-015', 1, NULL, 13250.00, 0.00, 0.00, 13250.00, 9200.00, 4050.00, 13250.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 12:17:59', '2026-10-11 12:17:59', '959c9c8e-3cb5-4605-a909-cca79cb08acd'),
(51, 'INV-20261011-016', 1, NULL, 22300.00, 0.00, 0.00, 22300.00, 15350.00, 6950.00, 22300.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 12:25:58', '2026-10-11 12:25:58', '156c9c25-afcd-40f6-9a61-89c95ff69e54'),
(52, 'INV-20261011-017', 1, NULL, 11750.00, 0.00, 0.00, 11750.00, 8179.00, 3571.00, 11750.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 14:20:47', '2026-10-11 14:20:47', 'eb134525-c781-4a19-aceb-6ee58a08d490'),
(53, 'INV-20261011-018', 1, NULL, 7000.00, 0.00, 0.00, 7000.00, 5047.00, 1953.00, 7000.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 14:51:28', '2026-10-11 14:51:28', '685c23df-c527-4e74-8ba3-7fd85e925267'),
(54, 'INV-20261011-019', 1, NULL, 2500.00, 0.00, 0.00, 2500.00, 1918.00, 582.00, 250.00, 0.00, 'CREDIT', 'PARTIAL', NULL, '2026-10-11 14:52:30', '2026-10-11 14:52:30', '6fda0667-3a64-49cd-b4f1-ca3b3bda27d7'),
(55, 'INV-20261011-020', 1, NULL, 2250.00, 0.00, 0.00, 2250.00, 1718.00, 532.00, 2250.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 15:01:16', '2026-10-11 15:01:16', 'f781c961-9733-46e7-8ffe-2d4326409632'),
(56, 'INV-20261011-021', 1, NULL, 8850.00, 0.00, 0.00, 8850.00, 6050.00, 2800.00, 8.75, 0.00, 'CREDIT', 'PARTIAL', NULL, '2026-10-11 16:14:57', '2026-10-11 16:14:57', 'e3f4aa94-09e6-4201-94c4-af87e9c096fd'),
(57, 'INV-20261011-022', 1, NULL, 43100.00, 0.00, 0.00, 43100.00, 31629.00, 11471.00, 43.00, 0.00, 'CREDIT', 'PARTIAL', NULL, '2026-10-11 16:56:32', '2026-10-11 16:56:32', '9e6a7965-7205-45e0-9264-b01c66b2878e'),
(58, 'INV-20261011-023', 1, NULL, 9500.00, 0.00, 0.00, 9500.00, 6379.00, 3121.00, 9500.00, 0.00, 'CREDIT', 'PAID', NULL, '2026-10-11 16:57:20', '2026-10-11 16:57:20', '8ff25db2-cdfb-43ba-9395-89b5a094b3e0'),
(59, 'INV-20261011-024', 1, NULL, 500.00, 0.00, 0.00, 500.00, 300.00, 200.00, 500.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-11 20:00:49', '2026-10-11 20:00:49', '80c62302-0a93-4635-8ac3-d05f923034cb'),
(60, 'INV-20261012-001', 1, NULL, 5000.00, 0.00, 0.00, 5000.00, 4000.00, 1000.00, 5000.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-12 07:43:58', '2026-10-12 07:43:58', 'd1dea4b8-14d1-4ac5-98df-6190be86abda'),
(61, 'INV-20261012-002', 1, NULL, 13000.00, 0.00, 0.00, 13000.00, 10250.00, 2750.00, 13000.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-12 07:49:05', '2026-10-12 07:49:05', 'fbea0312-a9e8-4945-8000-6300dfba782a'),
(62, 'INV-20261012-003', 1, NULL, 5000.00, 0.00, 0.00, 5000.00, 4000.00, 1000.00, 5000.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-12 08:23:47', '2026-10-12 08:23:47', '0a33491c-3eba-45f4-ad41-79c76af3f74c'),
(63, 'INV-20261012-004', 1, NULL, 2500.00, 0.00, 0.00, 2500.00, 2000.00, 500.00, 2500.00, 0.00, 'CASH', 'PAID', NULL, '2026-10-12 08:24:59', '2026-10-12 08:24:59', '666aa6aa-e5b0-419c-8cc0-0ac1b70f1518'),
(64, 'INV-20261013-001', 1, 24, 2500.00, 0.00, 0.00, 2500.00, 1918.00, 582.00, 12.00, 0.00, 'CREDIT', 'PARTIAL', NULL, '2026-10-13 17:01:47', '2026-10-13 17:01:47', 'd21d0e94-642c-44ce-b1fb-94d42c97cd46');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `sale_id` bigint UNSIGNED NOT NULL,
  `product_id` bigint UNSIGNED NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `purchase_cost` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `total` decimal(14,2) NOT NULL,
  `profit` decimal(14,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_items_sale_id_index` (`sale_id`),
  KEY `sale_items_product_id_index` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=243 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(131, 35, 20, 1.00, 1400.00, 900.00, 0.00, 1400.00, 500.00),
(132, 36, 20, 4.00, 1400.00, 900.00, 0.00, 5600.00, 2000.00),
(133, 36, 11, 2.00, 500.00, 250.00, 0.00, 1000.00, 500.00),
(134, 36, 10, 1.00, 1250.00, 800.00, 0.00, 1250.00, 450.00),
(135, 36, 22, 2.00, 250.00, 200.00, 0.00, 500.00, 100.00),
(136, 37, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(137, 37, 21, 1.00, 3000.00, 2000.00, 0.00, 3000.00, 1000.00),
(138, 37, 19, 1.00, 2600.00, 1800.00, 0.00, 2600.00, 800.00),
(139, 37, 20, 1.00, 1400.00, 900.00, 0.00, 1400.00, 500.00),
(140, 37, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(141, 37, 17, 1.00, 2000.00, 1400.00, 0.00, 2000.00, 600.00),
(142, 37, 16, 1.00, 750.00, 500.00, 0.00, 750.00, 250.00),
(143, 37, 15, 1.00, 3500.00, 2500.00, 0.00, 3500.00, 1000.00),
(144, 37, 13, 1.00, 2000.00, 1250.00, 0.00, 2000.00, 750.00),
(145, 37, 14, 1.00, 3000.00, 2200.00, 0.00, 3000.00, 800.00),
(146, 38, 16, 1.00, 750.00, 500.00, 0.00, 750.00, 250.00),
(147, 38, 15, 1.00, 3500.00, 2500.00, 0.00, 3500.00, 1000.00),
(148, 39, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(149, 40, 12, 1.00, 600.00, 1000.00, 0.00, 600.00, -400.00),
(150, 41, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(151, 41, 21, 1.00, 3000.00, 2000.00, 0.00, 3000.00, 1000.00),
(152, 42, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(153, 42, 21, 1.00, 3000.00, 2000.00, 0.00, 3000.00, 1000.00),
(154, 43, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(155, 43, 21, 1.00, 3000.00, 2000.00, 0.00, 3000.00, 1000.00),
(156, 44, 23, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(157, 45, 23, 2.00, 250.00, 200.00, 0.00, 500.00, 100.00),
(158, 46, 23, 16.00, 250.00, 200.00, 0.00, 4000.00, 800.00),
(159, 47, 23, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(160, 47, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(161, 47, 19, 3.00, 2600.00, 1800.00, 0.00, 7800.00, 2400.00),
(162, 47, 14, 1.00, 3000.00, 2200.00, 0.00, 3000.00, 800.00),
(163, 47, 15, 1.00, 3500.00, 2500.00, 0.00, 3500.00, 1000.00),
(164, 47, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(165, 47, 17, 1.00, 2000.00, 1400.00, 0.00, 2000.00, 600.00),
(166, 48, 21, 1.00, 2250.00, 1718.00, 0.00, 2250.00, 532.00),
(167, 48, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(168, 48, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(169, 48, 17, 1.00, 2000.00, 1400.00, 0.00, 2000.00, 600.00),
(170, 48, 14, 1.00, 3000.00, 2200.00, 0.00, 3000.00, 800.00),
(171, 48, 19, 1.00, 2600.00, 1800.00, 0.00, 2600.00, 800.00),
(172, 49, 6, 4.00, 8000.00, 6500.00, 0.00, 32000.00, 6000.00),
(173, 49, 10, 2.00, 1250.00, 800.00, 0.00, 2500.00, 900.00),
(174, 49, 9, 1.00, 1100.00, 750.00, 0.00, 1100.00, 350.00),
(175, 49, 5, 1.00, 5000.00, 3750.00, 0.00, 5000.00, 1250.00),
(176, 49, 7, 1.00, 1500.00, 1000.00, 0.00, 1500.00, 500.00),
(177, 49, 2, 2.00, 4750.00, 3500.00, 0.00, 9500.00, 2500.00),
(178, 49, 24, 1.00, 250.00, 229.00, 0.00, 250.00, 21.00),
(179, 49, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(180, 49, 13, 1.00, 2000.00, 1250.00, 0.00, 2000.00, 750.00),
(181, 50, 23, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(182, 50, 18, 2.00, 1000.00, 600.00, 0.00, 2000.00, 800.00),
(183, 50, 17, 4.00, 2000.00, 1400.00, 0.00, 8000.00, 2400.00),
(184, 50, 14, 1.00, 3000.00, 2200.00, 0.00, 3000.00, 800.00),
(185, 51, 13, 1.00, 2000.00, 1250.00, 0.00, 2000.00, 750.00),
(186, 51, 14, 1.00, 3000.00, 2200.00, 0.00, 3000.00, 800.00),
(187, 51, 15, 1.00, 3500.00, 2500.00, 0.00, 3500.00, 1000.00),
(188, 51, 16, 1.00, 750.00, 500.00, 0.00, 750.00, 250.00),
(189, 51, 20, 1.00, 1400.00, 900.00, 0.00, 1400.00, 500.00),
(190, 51, 19, 4.00, 2600.00, 1800.00, 0.00, 10400.00, 3200.00),
(191, 51, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(192, 51, 23, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(193, 52, 15, 1.00, 3500.00, 2500.00, 0.00, 3500.00, 1000.00),
(194, 52, 14, 1.00, 3000.00, 2200.00, 0.00, 3000.00, 800.00),
(195, 52, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(196, 52, 17, 1.00, 2000.00, 1400.00, 0.00, 2000.00, 600.00),
(197, 52, 13, 1.00, 2000.00, 1250.00, 0.00, 2000.00, 750.00),
(198, 52, 24, 1.00, 250.00, 229.00, 0.00, 250.00, 21.00),
(199, 53, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(200, 53, 21, 1.00, 2250.00, 1718.00, 0.00, 2250.00, 532.00),
(201, 53, 23, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(202, 53, 24, 1.00, 250.00, 229.00, 0.00, 250.00, 21.00),
(203, 53, 20, 1.00, 1400.00, 900.00, 0.00, 1400.00, 500.00),
(204, 53, 19, 1.00, 2600.00, 1800.00, 0.00, 2600.00, 800.00),
(205, 54, 22, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(206, 54, 21, 1.00, 2250.00, 1718.00, 0.00, 2250.00, 532.00),
(207, 55, 21, 1.00, 2250.00, 1718.00, 0.00, 2250.00, 532.00),
(208, 56, 19, 1.00, 2600.00, 1800.00, 0.00, 2600.00, 800.00),
(209, 56, 23, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(210, 56, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(211, 56, 13, 1.00, 2000.00, 1250.00, 0.00, 2000.00, 750.00),
(212, 56, 14, 1.00, 3000.00, 2200.00, 0.00, 3000.00, 800.00),
(213, 57, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(214, 57, 17, 1.00, 2000.00, 1400.00, 0.00, 2000.00, 600.00),
(215, 57, 23, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(216, 57, 24, 1.00, 250.00, 229.00, 0.00, 250.00, 21.00),
(217, 57, 3, 1.00, 2250.00, 1500.00, 0.00, 2250.00, 750.00),
(218, 57, 7, 2.00, 1500.00, 1000.00, 0.00, 3000.00, 1000.00),
(219, 57, 5, 3.00, 5000.00, 3750.00, 0.00, 15000.00, 3750.00),
(220, 57, 10, 1.00, 1250.00, 800.00, 0.00, 1250.00, 450.00),
(221, 57, 11, 1.00, 500.00, 250.00, 0.00, 500.00, 250.00),
(222, 57, 12, 1.00, 600.00, 400.00, 0.00, 600.00, 200.00),
(223, 57, 8, 1.00, 2500.00, 1750.00, 0.00, 2500.00, 750.00),
(224, 57, 6, 1.00, 8000.00, 6500.00, 0.00, 8000.00, 1500.00),
(225, 57, 1, 1.00, 1750.00, 1250.00, 0.00, 1750.00, 500.00),
(226, 57, 2, 1.00, 4750.00, 3500.00, 0.00, 4750.00, 1250.00),
(227, 58, 17, 1.00, 2000.00, 1400.00, 0.00, 2000.00, 600.00),
(228, 58, 13, 1.00, 2000.00, 1250.00, 0.00, 2000.00, 750.00),
(229, 58, 18, 1.00, 1000.00, 600.00, 0.00, 1000.00, 400.00),
(230, 58, 19, 1.00, 2600.00, 1800.00, 0.00, 2600.00, 800.00),
(231, 58, 20, 1.00, 1400.00, 900.00, 0.00, 1400.00, 500.00),
(232, 58, 24, 1.00, 250.00, 229.00, 0.00, 250.00, 21.00),
(233, 58, 23, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(234, 59, 18, 0.50, 1000.00, 600.00, 0.00, 500.00, 200.00),
(235, 60, 26, 1.00, 4000.00, 3250.00, 0.00, 4000.00, 750.00),
(236, 60, 27, 1.00, 1000.00, 750.00, 0.00, 1000.00, 250.00),
(237, 61, 26, 2.00, 4000.00, 3250.00, 0.00, 8000.00, 1500.00),
(238, 61, 27, 5.00, 1000.00, 750.00, 0.00, 5000.00, 1250.00),
(239, 62, 31, 20.00, 250.00, 200.00, 0.00, 5000.00, 1000.00),
(240, 63, 31, 10.00, 250.00, 200.00, 0.00, 2500.00, 500.00),
(241, 64, 31, 1.00, 250.00, 200.00, 0.00, 250.00, 50.00),
(242, 64, 21, 1.00, 2250.00, 1718.00, 0.00, 2250.00, 532.00);

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('0DtzhuPBvLbR2tXA2VEZav8cONqkNe0lTpxoireF', NULL, '185.95.206.16', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/2.31226.1 Chrome/152.0.7977.130 Safari/537.36 MSIX', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTGhldk4yTTM3amhHTEZhSExSVU1QUGM4NUhrQ2hPQ1B0c0ZXc25MUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791682181),
('0hTvvJDJ1Eansdb5EqktIkFnVazEVATDxeXUXr7E', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/2.31226.1 Chrome/152.0.7977.130 Safari/537.36 MSIX', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV285QUlpMXFTc3VzQmFFS3kzYUpxc2phTm5CZHlBQkszbVE2SHN2QSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5MCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791892427),
('1BOvoYvA5lJWeByhUPcc66963LuOi81nG42bNYNE', NULL, '161.35.183.194', 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:59.0) Gecko/20100101 Firefox/59.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ2VmUm5RaU9nZjNQV0lNc2sweGVlTlg4ZVRBMFdDM2tlaTRYZmdHSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791676889),
('1tPOWsVah2t9LF25I6Ao1rewrDZ0WNFlk9mXBE8g', NULL, '185.95.206.16', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY0hpRmZ3YXRwU1VNR2k3ZVJPNk4wb0lCaTVUUFBUcHBVV3dFTTZhMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791682452),
('36aXqimpmuprkoJ1JYdURKF8qV7Gc7uwQcMA3y3z', NULL, '2a03:2880:32ff:4::', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOW1RSEhUdnF4b3BlMjVTZnQ4MEl1V0k5MnNlTmU3VmxIcUpSUzNSeSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791705533),
('3ofYmsB1kPblZp9UUnj6S44VqYURXV79JBzLPoz3', NULL, '185.244.152.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQjk5VFA3NGFCVHB6ZldRbVRIZnAxVFJkR1RNYWc2MVJmSEp1WWE4TiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791795927),
('3RoUpWcCpMrYIHzWlTMKJPs4mu8xQbsdC21HFvgD', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoialFKTVd4ZlB6UGxjUEU4Qms5aTFQQnJzbUt6bGxwUnM1UWp3Nk4wdyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5MCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791923081),
('3Yrl3MLiiccfvSsgT2i9w9nuT0KDkBe0LOsKyMg4', NULL, '151.236.166.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicTVGNU5FbTJleHl3bVVHS2Y2dWZBNjkxY2ZLVDR1MHUwNExUcHdWNyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791888942),
('4cwRjLNIikdNbEI6uMr9Get5AzwYKgNaLl4Mp8Sl', NULL, '185.95.206.109', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRFNucW5aT1lOZWxNMWc4ZE9LZW1UTUY4NElhdHRtdjJDNHhENmEzWSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791672689),
('5bstJqGorUmo2mnS9fOFyMGO3yzwGwzTcTBVBXUp', NULL, '185.95.206.109', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYUI5UFptRjNXSDZiT1g5SHVkeTVJa25PdlNmaWwzcEFqdE5oTjdtZSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791671638),
('5CU5VgjO8IxIKEUPjbknPBU7olDD7r9rIUvORHRE', NULL, '185.95.206.109', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRzJrYVVEZGh5MUlENGtYU0thMExhUkZuNjgybHFqNkF6ZTJrWnFFeiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791671639),
('5ttrVQeB4i7jCR2f0F0O12OiWDpAmboU7aGoJp8d', NULL, '2a05:9cc4:412:952:8e8d:40c3:ee8c:4633', 'Mozilla/5.0 (Linux; Android 16; SM-A346B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/154.0.8037.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/582.0.0.61.92;]', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieVpxNGhIMm15RlRkTm1GTHNRamxDbUNhcGJXNU1pTXVNeEJ5QXVpVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791737979),
('6wHOfG0Kdz8PMYD5MfwgfSzBRo7jTXJgycQeMXEQ', NULL, '185.95.206.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23G71 [FBAN/FBIOS;FBAV/580.0.0.29.107;FBBV/1073972887;FBDV/iPhone15,3;FBMD/iPhone;FBSN/iOS;FBSV/26.6;FBSS/3;FBCR/;FBID/phone;FBLC/en_DZ;FBOP/80]', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiN3NjdUdHb0lwZDdUVWJhNlY3ZTRzWnZXdktsN2NvWWZ2MTRqcXdEVSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjMwOiJodHRwczovL3JlZC1iYWRnZXItODU5MzY2Lmhvc3RpbmdlcnNpdGUuY29tLz9mYmNsaWQ9SXdaWGgwYmdOaFpXMENNVEVBY0dSdlpnTnpjblJqQm1Gd2NGOXBaQTgwTXpjMk1qWXpNVFk1TnpNM09EZ0FBUjZEWFNacG9JSG1IVy1hS2t4b0RBS0VCRTd0RjNtS2MtaVlZanNHSnBKc0M5WWQ3bjJKdFRjQzFoemhwZ19hZW1fS0t0RXVseHNjN0o3ZkFHM3RSblozZyZ1dG1faWQ9OTc3NTdfdjBfczAwX2UwX3R2MCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791705622),
('935ZTRItcrIpXOpYPlsJzYVwbaQVWGbG4IaH19pE', NULL, '185.95.206.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23G71 [FBAN/FBIOS;FBAV/580.0.0.29.107;FBBV/1073972887;FBDV/iPhone15,3;FBMD/iPhone;FBSN/iOS;FBSV/26.6;FBSS/3;FBCR/;FBID/phone;FBLC/en_DZ;FBOP/80]', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZEkxaHRWWWVubXVQbXU1YjFHVDhoaFNkeHIySGZEejRYQnRqand2ciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791681791),
('9UBk1IauYeCR6sXPjx5nJ81eEJUyyMf2s0m27rO5', NULL, '185.244.152.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYjZ4emU5WkNEMXRGbklYQkNqb2F4THNFZUJ2NWNXWjZzVHZjQTZvOCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791708476),
('AAWWCGfmjTQT2vKeXMxCgA2KQhZSZyeAhqSb8b6Q', NULL, '185.95.206.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/23G71 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieHk4eHJhUTZqV3dGZ2JUNmQwelcxMlVkWmdHaTBrOXFhTlk4VDRUaSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791682484),
('aHIaX7iOYJt7TA7Bd9Pxae7R54cg9QKChZYonTCm', NULL, '185.95.206.123', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOUk1cjVCTU8xVWVUMVNEN2JSZEJLWERKY3Q3QzFLTzJqY05FdGJIUiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791711061),
('ahvLM2an8gIINoa96vDg4uB92bSsaGORBh4sJs1X', NULL, '185.244.152.135', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZVFvdmNpdmVTb0huZWk2QmRRSTltTENjVzJZY3FZTTR1d3RmdkVNTyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791751627),
('CR4VlMikzBfn9I3vViiQyA1sPMnOKStezetiSGip', NULL, '2a03:2880:15ff::', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ3Y1b1gya1lOZzlrQW1QMGdtek9OODZlNHAwZ21QbTRUcUdqc3A4diI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791705582),
('dbkEPjUO5vQRQLkiOb4yGE3zPSI4OCXei5AgBqht', NULL, '185.244.152.135', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiejRhT2t5NDcySEtyd0s3c2RDcm9aelRsaTZnYjJoelVSWGxXWVowQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791735017),
('dS7kTAMWq8VcnpKAVBWCdGVxTHrZ6gRhebdFMk5x', NULL, '185.244.152.135', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibkJQRTZjakZObnhuWGZtRlBKTmxqbUpGSUk4YzVSRUtVNHZxdUlWRyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791742800),
('hDV0okYKFQNHwpJfHAZSC5QIyytZNhMfbg5zaJkL', NULL, '151.236.166.238', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT000WmptcmY1eUhYUWR1dUtuUXcxVVJTRmtqQkJxdEhNRzdxZDFyZyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791845909),
('hiBoFTQDC1p4wOyk7rVZnnLt84g8FbmcjgIJ1H5p', NULL, '185.244.152.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOGRsNHFvSUdERkxuQzlQcWIwUGo4RzlYT1A0ZzUyZlc4WElrenZOSSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791766325),
('hlZhBQ49Z0YoWLeKbL4IJ2PLWdokoM57u6D3ZXK8', NULL, '185.95.206.109', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Claude/2.31226.1 Chrome/152.0.7977.130 Safari/537.36 MSIX', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaGJySnY0UkxLR0drMFVVYm1JNFphV3JzWkVOVnhpN2ladkxIb1pXTiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791672875),
('Ienvr3OI1nciADukhHF0slph3YXmBwdPaRQ8729F', NULL, '185.244.152.227', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaUs3bXlsU09kUUJEb080NWRQNkpBUXNxQ0s2T0VJQnRuM0hBUXR4UiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791718582),
('INGF2Lt0aaISZKOUBGrW6ZCbpCUu69VUVCB7Eqtu', NULL, '185.240.19.123', 'Mozilla/5.0 (Linux; Android 16; SM-S908E Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/154.0.8037.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/581.0.0.49.91;]', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicVJROTluVjhOMk9oUHk5RkNMTFRrWWR4bmRuR0NlNHR5VkNvdWlmNSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjM2OiJodHRwczovL3JlZC1iYWRnZXItODU5MzY2Lmhvc3RpbmdlcnNpdGUuY29tLz9mYmNsaWQ9SXdZMnhqYXdVNEtNQmxlSFJ1QTJGbGJRSXhNUUJ3Wkc5bUJYTnlkR01HWVhCd1gybGtERE0xTURZNE5UVXpNVGN5T0FBQkhsUXVTQ2RZRGYwY292blFabGloaktUUTBNb3ZBMnRRTDZkNDQxeXZSZlFTZDF2SlItNUV2Q0JsOFc2c19hZW1fcG4tbzctTmVfcUxYaEp1a0RtdFoyZyZ1dG1faWQ9OTc3NTdfdjBfczAwX2UwX3R2MCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791707505),
('j40PO3b94fOcZ65jObqRtDeRHVZ2890TQmBGda9B', NULL, '93.88.156.71', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZk8wSG9TM2lGcHZZazZYMkI0bG9YMUd6ZTJGZW1JOTR3aEdGZ1gxVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791745918),
('JDTONTbdMNKyXOYRuPMs76fhwa3CuENZzZl5vfOT', NULL, '185.95.207.53', 'Mozilla/5.0 (Linux; Android 12; C70 Build/SP1A.210812.016; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/154.0.8037.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/580.0.0.49.91;]', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiMXNhNDZtUWFJQnc1SEFtdFFPTmI3REliTEl4T0FBNUJhZmZ5cDc3diI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791747080),
('jfbsUDoA2U4wPcYaHWOpJKXVqb2JaJimdNMDRxQF', NULL, '185.95.206.109', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZGx6SUtyZndYTTVvQ2VQamFxSmRSTUN5QnBXb1drdWZDUFV2RVBWdSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791730016),
('jZi29CLCFNojb0AJrtCd05tDLbNRyKEciUmXBnSJ', NULL, '185.95.206.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/23G71 [FBAN/FBIOS;FBAV/580.0.0.29.107;FBBV/1073972887;FBDV/iPhone15,3;FBMD/iPhone;FBSN/iOS;FBSV/26.6;FBSS/3;FBCR/;FBID/phone;FBLC/en_DZ;FBOP/80]', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVTRXNm4yeHJjS25rY0lweTRCUGx4QVQ4TkpMeW5VUmNaRExGS2lNTCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791673571),
('ka1s6DyJOZNRtPPtEAIT8CPkc60yovHz6CD6CtI2', NULL, '185.95.206.109', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWEc1SXRPTm51bFR6OG5VRmREcHp4Yzl0TU9ENmVNYjEyZmNiR3k4NCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791730079),
('Kq1rIWo0VXS3l1nDcnRrlqjKOeFlaQwgFHURksh8', NULL, '185.84.71.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOGRHWjh3b1B5aU5oTjRCWlZjZnc3VUpOWWNUREs3cURIc2VTTXFXMiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791717275),
('LAELwStMQfe8nd1oephdpJ6anjlrZ94LlNxZUyl9', NULL, '185.95.206.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibDdmc291Vlp3MXpPcTloQ2hCeVdJb0k0VkR0SENkQXY5TXJON0RUNyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791682440),
('LcvvKP3sCeM1KJNOx6Hjl6FguBUPyOSP1mWhCrCu', NULL, '185.95.206.16', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWkxXd3lib3Frd2JmUFFsUURoUkpUd3lKck5uc0dCMFAzbWpqUXRFcSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791681727),
('LeUthln0Gy6qJ3IDcC1T4sGFKIBs3HYp3Uu2wKpM', NULL, '2a03:2880:25ff:5b::', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNGJ4NmdRQ3BYdVRuTkY2bW01bTF1MHplYmRpQ1lPWVhtbGVNRnRuWCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk5OiJodHRwczovL3JlZC1iYWRnZXItODU5MzY2Lmhvc3RpbmdlcnNpdGUuY29tLz9mYmNsaWQ9SXdaWGgwYmdOaFpXMENNVEVBY0dSdlpnUnpjblJqQm1Gd2NGOXBaQXd5TlRZeU9ERXdOREExTlRnQUFSNV8xWEJaWEZZQ0hNM3JscUN6SUZ4LTB1Rm81bFd4ZGQzNHJ2QVo5cDBNMDRkTUR1NkIzdzg3VndacU1BX2FlbV9iNHBlMnZjLVJfX2ozNjdOb0xTQ0tBIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791705573),
('Lo2DQ3zPcS2TMmpDGZBXqL9lVEb15gjSSE8TCTRc', NULL, '185.244.152.135', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRGUzUllBcXlvRjF5em82eHZXZ2d2ekU4ZTJhaVhzOFdiS1pranViVyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791766320),
('Lw0chvtkwguwG0wZZcAAthlsHdLSFuVQQVHSOREg', NULL, '2a03:2880:15ff:1::', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUlhoSXQ0bWlzZzVuYU9Fd2FPYTVrZ2h5WjEwVDdTWHN0YkNxQ2RCVCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791705539),
('lWRGdmjDlQjo7VHmsZZbIbJB4Oz1PiPYBIxeBnZd', NULL, '185.95.206.109', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT0xhNHBkNkY5TjY2NVBNbjhscnRpUnNtQ1NXVndSSE53ckkyTzRjQSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791671580),
('m5kl2jJs3sdEYpU1SgNORXWLIXv2RXkgpzqXl4AK', NULL, '2a03:2880:22ff:47::', 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYnNCTURhdmZZWDZ0NUNxR1JwOVJta2hZeGo2TmZERndlSVNxSmhvbSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791705540),
('MMmPqaW631Lvf68lBPvk7FLtVY3y6AFAUtpDfHMI', NULL, '185.95.206.109', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUUkweHdxZU81R3NJR2VmOEdzNG1xZ1V3R0wxY040MXluMEpMOHYyYyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791671583),
('MV7k1QVlfebDLGUYpucgtyl0Daxgo7o7xRQpZDQL', NULL, '151.236.179.94', 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.36 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSXB1UmRrSlU1dU1FRVo2VW4wTmNpM2lCZGMyUDVxR3RVeEJMa3loRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791673585),
('n9AgIMN0z7xlVR2N7Lt0CCYtwreIqur6DL9DewV4', NULL, '185.244.152.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiNEVSWDhPZkMwa1BPSzZXdnlOZ1FQT0NVMWd4cUVmenAwSmh5U3R1MSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791766301),
('nCNQ4o0EXZfR3pJNvg99Vhtv5hXGSgx10v8vrh7h', NULL, '185.240.19.123', 'WhatsApp/2.23.20.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicUJPSXJGR1JsYUZETExwemdSekpQN3RjMWtFTHhoQkVKRlU1YU9XYyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791707781),
('ntB0amygLpQmThDb9EULiwJJns1K0NiB1s3kSnuY', NULL, '185.95.206.16', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoia0l4NHBlRTFZTGNPOFBHZWJzV21Cd1BOalk1UW16ZHJIUnNjSUM3ZiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791682282),
('p1lEnbITGcpNknYVvSUkKFLtJvwsizNJ7aofBX1o', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-US) WindowsPowerShell/5.1.26100.9549', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTTlKWW5QdmltcHNWaEZ3aWdDYzhRaGxIeVRpRFpnR3FNc0txQzVqViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5MCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791892819),
('pP4xs1J9b6QcRZXrLDXhsvaUcfx0w3hbCILydZJ9', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiS3VSQW1OWFprYVV3czdmVUVHWVUxUkZCVkwyMkNGUVFZQVBueXVhZyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5MCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791924202),
('PTTP1qYZrwEpSwyQ9WQ2NWHzAB6TUgCqF5WnM5d5', NULL, '2a03:2880:f806:3b::', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiVThIQkl3a0FGVzBTanY2OVFHU3dpM2JQQlo3Q09tWHJXWmJMYm5jQyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MTk5OiJodHRwczovL3JlZC1iYWRnZXItODU5MzY2Lmhvc3RpbmdlcnNpdGUuY29tLz9mYmNsaWQ9SXdaWGgwYmdOaFpXMENNVEVBY0dSdlpnUnpjblJqQm1Gd2NGOXBaQXd5TlRZeU9ERXdOREExTlRnQUFSNV8xWEJaWEZZQ0hNM3JscUN6SUZ4LTB1Rm81bFd4ZGQzNHJ2QVo5cDBNMDRkTUR1NkIzdzg3VndacU1BX2FlbV9iNHBlMnZjLVJfX2ozNjdOb0xTQ0tBIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791705538),
('QCaRJ73UQMJaG3MRDM6pTYvcgqkDOmKB865Prsu0', NULL, '185.95.206.109', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoia0dzbnptV0RiQ0pwM1RvdFk4UUFva2pCVExQUktDemlpNlRVRDRldyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791672145),
('qZQztT92CJ6t1YNKQgehZiqikPDz1GYWJSyAltQU', NULL, '151.236.166.74', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR3FqbldkSXNyOHdrVGNsU053M2VjZ0FGSlUzbWtPRmxZbUtJalZzRCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791682565),
('RCeHde7YHSOSEmWJXiBBKYUXQNliMUOE3OSquhXG', NULL, '185.95.206.109', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiWW4zdjBtcUtaRW92cW1tTlhzS2dKUFBhYmhTWUloY1FNWlMxbzViMyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791673302),
('sJYXnJKsHHvjzRForket4wLLl1ekeMUY9omNAB14', NULL, '151.236.166.238', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiT0dRckw0YWQ0RWpONTd6VkFHZUlVdWlIZlZISUwwMzZBOHFmNmVtbCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791845931),
('sW51TMsJpppHpqLQjMlxqMa0ioJ7116pMZcTjmTC', NULL, '2a05:9cc4:412:952:e39d:fe02:1ad6:6a55', 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiUmhVenhoQkpEYTh0WUFnUVI2VjNKc1FiWFAwNUxERXR3dENFV3RxSyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791742305),
('t7VzebuNF0tUl0XEhLy7bUgSOaN4ndyShqGs8g30', NULL, '185.95.206.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiYWF0WWZBdGd0TFdnanROM3RZZ0p6ZmphRWlxTkhSVkppRHdBQUZZUyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791703631),
('tijrmDHz7GQ13darTYcNxsNmvXU3Gjv2wLPjAxfB', NULL, '185.244.152.135', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoicEpmcmszU2JybVo3bTNaaVZ4U20zMXlWejRIT3lLS1dFRzhIbm9jViI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791735018),
('Tkth6gDlwyD1Yqs1nYFsAFP0KglWknm6VECetoKs', NULL, '185.95.206.16', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTzd5aVB4UkJBUkFqS3ZwV3NhYXF5VlQ0WnEwbGNacGtrT1dxNkVXeiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791703629),
('tRLb0p6kLSkoaPKJ0PLRq1V2oc0jKNSCzFvprxlP', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoibXBsRUpJaW0ybnVyVjhEbVFRQ2lOR3huZ2xheTE3QmJUR1c5Zm8wayI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5MCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791893172),
('tX9xjIDsPdeAQh9EDQJsvDViUUqJOBFSL15T4uPZ', NULL, '185.95.206.109', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiaENXT3ZXYWtvZ1lqT05WTXNuWmUxY2wzdlJURFU0Q0JwSThYVFlOUCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791671570),
('ud5P5TUaUjCgCoOmmSnJDwqMaeMPUdd8WJkQGNhF', NULL, '151.236.179.94', 'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.36 Mobile Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQ3VEV0d6MWpkWkFMUXhkWm01MDgxQk00SkxsUUo5aW12MDY2cWRRSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791676897),
('uzDkAdLbjhy3ODgG8TCBZXQwN7U9hDxfhvt5DLyX', NULL, '185.244.152.68', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/155.0.0.0 Safari/537.36 Edg/155.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiSEdiMWVjUHRGOTRqUGNJNmFnZkdUdnk1NjJ0MDRkb292SjVWUXJ0ciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791813281),
('vTirTeFofyAOYoWu3p4e60Si4S8XCWMDXpUOPB1t', NULL, '185.95.206.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiRks1T0JTcDlhcnplUHdEY1gwQUlNT1VGRDdUUzFyZFI1dVloYzd2cSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791674014),
('vTZEyQhdQg2KD18sbv44qSKhTBeYxpnZOZPn1X4w', NULL, '185.95.206.109', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZVhMYXJ1UEJRT2NwUGZYckxPOFhBdHcxaXY4ek5VZk5teEFaTFJKMSI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791674012),
('vUGkHxsjEZRBRIyrZAyw9vSR8K6bj6UZWgaP8WQn', NULL, '185.244.152.135', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY0tYV0NjSkp2b2s1RTJjeXlQTTZkUW44dkFMT0duZVhSUlpHMTc3ZyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791735017),
('vvmham3WTteVeP8OnH7Q5Wl7Y83mEYZLjsNpSK0E', NULL, '185.244.152.135', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOVJyVzh0bW1lc01zSzU0S29uTE5sTmZhRkJiSWdiTEE4S3lPbHFxciI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791766319),
('wNDr5FV7UMd2KetlPL3nvorZYZ8SEazOFrN6ScZJ', NULL, '185.95.206.16', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiV2oxNDE2bG5udklxdWxVUDduWjZyY0JUc1BXOHZEUUlTQmNPUVZLSCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791703629),
('xuRWdg42czW0QjdpMAPxo8fBbKSTX9680ibEITRg', NULL, '185.95.206.16', 'curl/8.7.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiR2szMGlIWHQ4enBwUWpKVU4zbUdneXh6VEVzdElzbVM1bVNLQkhlbyI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791682175),
('Y3NEn2IjIPDbHnpUh38MX8RFIPCigtZLxEb1h1sy', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36 Edg/154.0.0.0', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiZ05ySU1vMnV1MGxRQmRMR0UzRkVESUZwRE5UZ0wyMjhGb0ZrT1U4OCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODA5MCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1791893223),
('YKbVAdlMWwtAuvla256nsHRUCsvpaXsdeyjuEhbg', NULL, '149.154.161.196', 'TelegramBot (like TwitterBot)', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiQjhWQmpGZ254WXhvRjJnZWJ4c2tjZW5KUDBnTkRIQ2FUZWE1MUJDcCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791673508),
('zE018BYdyQqwvueRvgLpi9v7NH89cYPQJ0DcRPrC', NULL, '2a12:f680:260:2c55:cb5:2bff:fe28:3cf7', 'Mozilla/5.0 (Linux; Android 16; 2312DRA50G Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/154.0.8037.106 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/581.0.0.49.91;]', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiY3hxMkdXUERrYWZOZDBvVG0yaTVyb1JKWFRhN3h4TzlURVZXVmhXNiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NDM6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20iO3M6NToicm91dGUiO047fXM6NjoiX2ZsYXNoIjthOjI6e3M6Mzoib2xkIjthOjA6e31zOjM6Im5ldyI7YTowOnt9fX0=', 1791689815),
('ZwgN0SVW3JaEoCmXSzRyCcYFZ9unr9UdnDzPxAsG', NULL, '185.244.152.135', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.0 Mobile/15E148 Safari/604.1', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoieWxOTzFzZmRaN0NubWhja1Y5QTk3Q1JDbWN2M2pIdnh6SFFXQ3J5eiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NzE6Imh0dHBzOi8vcmVkLWJhZGdlci04NTkzNjYuaG9zdGluZ2Vyc2l0ZS5jb20vP3V0bV9pZD05Nzc1N192MF9zMDBfZTBfdHYwIjtzOjU6InJvdXRlIjtOO31zOjY6Il9mbGFzaCI7YToyOntzOjM6Im9sZCI7YTowOnt9czozOiJuZXciO2E6MDp7fX19', 1791751627);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `key_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `key_value` text COLLATE utf8mb4_unicode_ci,
  `group_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_name_unique` (`key_name`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key_name`, `key_value`, `group_name`) VALUES
(1, 'store_name', 'سەنگەر مارکێت', 'general'),
(2, 'store_name_en', 'Sangar Markat', 'general'),
(3, 'store_name_ar', 'المغنية ماركات', 'general'),
(4, 'store_phone', '+964 750 123 4567', 'general'),
(5, 'store_address', 'هەولێر - شەقامی ٦٠ مەتری - بەرامبەر پارکی نیشتمان', 'general'),
(6, 'currency', 'IQD', 'general'),
(7, 'tax_percentage', '0', 'general'),
(8, 'invoice_prefix', 'INV-', 'general'),
(9, 'receipt_footer', 'سوپاس بۆ سەردانەکەتان، کاڵای فرۆشراو تا ٢٤ کاتژمێر دەگۆڕدرێتەوە', 'general'),
(10, 'default_language', 'ku', 'general'),
(11, 'allow_negative_stock', '0', 'general'),
(12, 'low_stock_threshold', '5', 'general'),
(13, 'expiry_alerts_enabled', '1', 'expiry'),
(14, 'expiry_warning_days', '7', 'expiry'),
(15, 'expiry_urgent_days', '3', 'expiry'),
(16, 'expiry_alerts_expired', '1', 'expiry'),
(17, 'expiry_alerts_bell', '1', 'expiry'),
(18, 'expiry_alerts_dashboard', '1', 'expiry');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` bigint UNSIGNED NOT NULL,
  `movement_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `damage_reason` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `previous_quantity` decimal(12,2) NOT NULL,
  `new_quantity` decimal(12,2) NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` bigint UNSIGNED DEFAULT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `stock_movements_user_id_foreign` (`user_id`),
  KEY `stock_movements_product_id_index` (`product_id`),
  KEY `stock_movements_movement_type_index` (`movement_type`),
  KEY `stock_movements_created_at_index` (`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=253 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(140, 12, 'PURCHASE', NULL, 300.00, 120.00, 420.00, 'PURCHASE', 3, 1, 'کڕین لە دابینکەر - پسوولەی PUR-1791655415773', '2026-10-10 15:36:07'),
(141, 20, 'SALE', NULL, 4.00, 26.00, 22.00, 'SALE', 36, 1, 'فرۆشتنی وەسڵ INV-20261011-001', '2026-10-11 01:25:29'),
(142, 11, 'SALE', NULL, 2.00, 100.00, 98.00, 'SALE', 36, 1, 'فرۆشتنی وەسڵ INV-20261011-001', '2026-10-11 01:25:29'),
(143, 10, 'SALE', NULL, 1.00, 40.00, 39.00, 'SALE', 36, 1, 'فرۆشتنی وەسڵ INV-20261011-001', '2026-10-11 01:25:29'),
(144, 22, 'SALE', NULL, 2.00, 32.00, 30.00, 'SALE', 36, 1, 'فرۆشتنی وەسڵ INV-20261011-001', '2026-10-11 01:25:29'),
(145, 22, 'SALE', NULL, 1.00, 30.00, 29.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(146, 21, 'SALE', NULL, 1.00, 8.00, 7.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(147, 19, 'SALE', NULL, 1.00, 22.00, 21.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(148, 20, 'SALE', NULL, 1.00, 22.00, 21.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(149, 18, 'SALE', NULL, 1.00, 26.00, 25.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(150, 17, 'SALE', NULL, 1.00, 31.00, 30.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(151, 16, 'SALE', NULL, 1.00, 25.00, 24.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(152, 15, 'SALE', NULL, 1.00, 22.00, 21.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(153, 13, 'SALE', NULL, 1.00, 38.00, 37.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(154, 14, 'SALE', NULL, 1.00, 34.00, 33.00, 'SALE', 37, 1, 'فرۆشتنی وەسڵ INV-20261011-002', '2026-10-11 01:30:04'),
(155, 16, 'SALE', NULL, 1.00, 24.00, 23.00, 'SALE', 38, 1, 'فرۆشتنی وەسڵ INV-20261011-003', '2026-10-11 01:33:44'),
(156, 15, 'SALE', NULL, 1.00, 21.00, 20.00, 'SALE', 38, 1, 'فرۆشتنی وەسڵ INV-20261011-003', '2026-10-11 01:33:44'),
(157, 22, 'SALE', NULL, 1.00, 29.00, 28.00, 'SALE', 39, 1, 'فرۆشتنی وەسڵ INV-20261011-004', '2026-10-11 01:33:50'),
(158, 12, 'SALE', NULL, 1.00, 420.00, 419.00, 'SALE', 40, 1, 'فرۆشتنی وەسڵ INV-20261011-005', '2026-10-11 01:33:57'),
(159, 22, 'SALE', NULL, 1.00, 28.00, 27.00, 'SALE', 41, 1, 'فرۆشتنی وەسڵ INV-20261011-006', '2026-10-11 01:34:07'),
(160, 21, 'SALE', NULL, 1.00, 7.00, 6.00, 'SALE', 41, 1, 'فرۆشتنی وەسڵ INV-20261011-006', '2026-10-11 01:34:07'),
(161, 22, 'SALE', NULL, 1.00, 27.00, 26.00, 'SALE', 42, 1, 'فرۆشتنی وەسڵ INV-20261011-007', '2026-10-11 01:35:08'),
(162, 21, 'SALE', NULL, 1.00, 6.00, 5.00, 'SALE', 42, 1, 'فرۆشتنی وەسڵ INV-20261011-007', '2026-10-11 01:35:08'),
(163, 22, 'SALE', NULL, 1.00, 26.00, 25.00, 'SALE', 43, 1, 'فرۆشتنی وەسڵ INV-20261011-008', '2026-10-11 01:35:44'),
(164, 21, 'SALE', NULL, 1.00, 5.00, 4.00, 'SALE', 43, 1, 'فرۆشتنی وەسڵ INV-20261011-008', '2026-10-11 01:35:44'),
(165, 23, 'SALE', NULL, 1.00, 100.00, 99.00, 'SALE', 44, 1, 'فرۆشتنی وەسڵ INV-20261011-009', '2026-10-11 07:29:40'),
(166, 23, 'SALE', NULL, 2.00, 99.00, 97.00, 'SALE', 45, 1, 'فرۆشتنی وەسڵ INV-20261011-010', '2026-10-11 07:30:50'),
(167, 23, 'SALE', NULL, 16.00, 97.00, 81.00, 'SALE', 46, 1, 'فرۆشتنی وەسڵ INV-20261011-011', '2026-10-11 09:39:18'),
(168, 23, 'SALE', NULL, 1.00, 81.00, 80.00, 'SALE', 47, 1, 'فرۆشتنی وەسڵ INV-20261011-012', '2026-10-11 12:15:41'),
(169, 22, 'SALE', NULL, 1.00, 25.00, 24.00, 'SALE', 47, 1, 'فرۆشتنی وەسڵ INV-20261011-012', '2026-10-11 12:15:41'),
(170, 19, 'SALE', NULL, 3.00, 21.00, 18.00, 'SALE', 47, 1, 'فرۆشتنی وەسڵ INV-20261011-012', '2026-10-11 12:15:41'),
(171, 14, 'SALE', NULL, 1.00, 33.00, 32.00, 'SALE', 47, 1, 'فرۆشتنی وەسڵ INV-20261011-012', '2026-10-11 12:15:41'),
(172, 15, 'SALE', NULL, 1.00, 20.00, 19.00, 'SALE', 47, 1, 'فرۆشتنی وەسڵ INV-20261011-012', '2026-10-11 12:15:41'),
(173, 18, 'SALE', NULL, 1.00, 25.00, 24.00, 'SALE', 47, 1, 'فرۆشتنی وەسڵ INV-20261011-012', '2026-10-11 12:15:41'),
(174, 17, 'SALE', NULL, 1.00, 30.00, 29.00, 'SALE', 47, 1, 'فرۆشتنی وەسڵ INV-20261011-012', '2026-10-11 12:15:41'),
(175, 21, 'SALE', NULL, 1.00, 100.00, 99.00, 'SALE', 48, 1, 'فرۆشتنی وەسڵ INV-20261011-013', '2026-10-11 12:16:27'),
(176, 22, 'SALE', NULL, 1.00, 24.00, 23.00, 'SALE', 48, 1, 'فرۆشتنی وەسڵ INV-20261011-013', '2026-10-11 12:16:27'),
(177, 18, 'SALE', NULL, 1.00, 24.00, 23.00, 'SALE', 48, 1, 'فرۆشتنی وەسڵ INV-20261011-013', '2026-10-11 12:16:27'),
(178, 17, 'SALE', NULL, 1.00, 29.00, 28.00, 'SALE', 48, 1, 'فرۆشتنی وەسڵ INV-20261011-013', '2026-10-11 12:16:27'),
(179, 14, 'SALE', NULL, 1.00, 32.00, 31.00, 'SALE', 48, 1, 'فرۆشتنی وەسڵ INV-20261011-013', '2026-10-11 12:16:27'),
(180, 19, 'SALE', NULL, 1.00, 18.00, 17.00, 'SALE', 48, 1, 'فرۆشتنی وەسڵ INV-20261011-013', '2026-10-11 12:16:27'),
(181, 6, 'SALE', NULL, 4.00, 25.00, 21.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(182, 10, 'SALE', NULL, 2.00, 39.00, 37.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(183, 9, 'SALE', NULL, 1.00, 70.00, 69.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(184, 5, 'SALE', NULL, 1.00, 61.00, 60.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(185, 7, 'SALE', NULL, 1.00, 45.00, 44.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(186, 2, 'SALE', NULL, 2.00, 26.00, 24.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(187, 24, 'SALE', NULL, 1.00, 45.00, 44.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(188, 22, 'SALE', NULL, 1.00, 23.00, 22.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(189, 13, 'SALE', NULL, 1.00, 37.00, 36.00, 'SALE', 49, 1, 'فرۆشتنی وەسڵ INV-20261011-014', '2026-10-11 12:17:08'),
(190, 23, 'SALE', NULL, 1.00, 80.00, 79.00, 'SALE', 50, 1, 'فرۆشتنی وەسڵ INV-20261011-015', '2026-10-11 12:17:59'),
(191, 18, 'SALE', NULL, 2.00, 23.00, 21.00, 'SALE', 50, 1, 'فرۆشتنی وەسڵ INV-20261011-015', '2026-10-11 12:17:59'),
(192, 17, 'SALE', NULL, 4.00, 28.00, 24.00, 'SALE', 50, 1, 'فرۆشتنی وەسڵ INV-20261011-015', '2026-10-11 12:17:59'),
(193, 14, 'SALE', NULL, 1.00, 31.00, 30.00, 'SALE', 50, 1, 'فرۆشتنی وەسڵ INV-20261011-015', '2026-10-11 12:17:59'),
(194, 13, 'SALE', NULL, 1.00, 36.00, 35.00, 'SALE', 51, 1, 'فرۆشتنی وەسڵ INV-20261011-016', '2026-10-11 12:25:58'),
(195, 14, 'SALE', NULL, 1.00, 30.00, 29.00, 'SALE', 51, 1, 'فرۆشتنی وەسڵ INV-20261011-016', '2026-10-11 12:25:58'),
(196, 15, 'SALE', NULL, 1.00, 19.00, 18.00, 'SALE', 51, 1, 'فرۆشتنی وەسڵ INV-20261011-016', '2026-10-11 12:25:58'),
(197, 16, 'SALE', NULL, 1.00, 23.00, 22.00, 'SALE', 51, 1, 'فرۆشتنی وەسڵ INV-20261011-016', '2026-10-11 12:25:58'),
(198, 20, 'SALE', NULL, 1.00, 21.00, 20.00, 'SALE', 51, 1, 'فرۆشتنی وەسڵ INV-20261011-016', '2026-10-11 12:25:58'),
(199, 19, 'SALE', NULL, 4.00, 17.00, 13.00, 'SALE', 51, 1, 'فرۆشتنی وەسڵ INV-20261011-016', '2026-10-11 12:25:58'),
(200, 18, 'SALE', NULL, 1.00, 21.00, 20.00, 'SALE', 51, 1, 'فرۆشتنی وەسڵ INV-20261011-016', '2026-10-11 12:25:58'),
(201, 23, 'SALE', NULL, 1.00, 79.00, 78.00, 'SALE', 51, 1, 'فرۆشتنی وەسڵ INV-20261011-016', '2026-10-11 12:25:58'),
(202, 15, 'SALE', NULL, 1.00, 18.00, 17.00, 'SALE', 52, 1, 'فرۆشتنی وەسڵ INV-20261011-017', '2026-10-11 14:20:47'),
(203, 14, 'SALE', NULL, 1.00, 29.00, 28.00, 'SALE', 52, 1, 'فرۆشتنی وەسڵ INV-20261011-017', '2026-10-11 14:20:47'),
(204, 18, 'SALE', NULL, 1.00, 20.00, 19.00, 'SALE', 52, 1, 'فرۆشتنی وەسڵ INV-20261011-017', '2026-10-11 14:20:47'),
(205, 17, 'SALE', NULL, 1.00, 24.00, 23.00, 'SALE', 52, 1, 'فرۆشتنی وەسڵ INV-20261011-017', '2026-10-11 14:20:47'),
(206, 13, 'SALE', NULL, 1.00, 35.00, 34.00, 'SALE', 52, 1, 'فرۆشتنی وەسڵ INV-20261011-017', '2026-10-11 14:20:47'),
(207, 24, 'SALE', NULL, 1.00, 44.00, 43.00, 'SALE', 52, 1, 'فرۆشتنی وەسڵ INV-20261011-017', '2026-10-11 14:20:47'),
(208, 22, 'SALE', NULL, 1.00, 22.00, 21.00, 'SALE', 53, 1, 'فرۆشتنی وەسڵ INV-20261011-018', '2026-10-11 14:51:28'),
(209, 21, 'SALE', NULL, 1.00, 99.00, 98.00, 'SALE', 53, 1, 'فرۆشتنی وەسڵ INV-20261011-018', '2026-10-11 14:51:28'),
(210, 23, 'SALE', NULL, 1.00, 78.00, 77.00, 'SALE', 53, 1, 'فرۆشتنی وەسڵ INV-20261011-018', '2026-10-11 14:51:28'),
(211, 24, 'SALE', NULL, 1.00, 43.00, 42.00, 'SALE', 53, 1, 'فرۆشتنی وەسڵ INV-20261011-018', '2026-10-11 14:51:28'),
(212, 20, 'SALE', NULL, 1.00, 20.00, 19.00, 'SALE', 53, 1, 'فرۆشتنی وەسڵ INV-20261011-018', '2026-10-11 14:51:28'),
(213, 19, 'SALE', NULL, 1.00, 13.00, 12.00, 'SALE', 53, 1, 'فرۆشتنی وەسڵ INV-20261011-018', '2026-10-11 14:51:28'),
(214, 22, 'SALE', NULL, 1.00, 21.00, 20.00, 'SALE', 54, 1, 'فرۆشتنی وەسڵ INV-20261011-019', '2026-10-11 14:52:30'),
(215, 21, 'SALE', NULL, 1.00, 98.00, 97.00, 'SALE', 54, 1, 'فرۆشتنی وەسڵ INV-20261011-019', '2026-10-11 14:52:30'),
(216, 21, 'SALE', NULL, 1.00, 97.00, 96.00, 'SALE', 55, 1, 'فرۆشتنی وەسڵ INV-20261011-020', '2026-10-11 15:01:16'),
(217, 12, 'ADJUSTMENT', NULL, 300.00, 419.00, 119.00, 'PURCHASE_REVERSAL', 3, 1, 'گەڕاندنەوەی کاڵا بەهۆی سڕینەوەی پسوولەی PUR-1791655415773', '2026-10-11 16:13:30'),
(218, 19, 'SALE', NULL, 1.00, 12.00, 11.00, 'SALE', 56, 1, 'فرۆشتنی وەسڵ INV-20261011-021', '2026-10-11 16:14:57'),
(219, 23, 'SALE', NULL, 1.00, 77.00, 76.00, 'SALE', 56, 1, 'فرۆشتنی وەسڵ INV-20261011-021', '2026-10-11 16:14:57'),
(220, 18, 'SALE', NULL, 1.00, 19.00, 18.00, 'SALE', 56, 1, 'فرۆشتنی وەسڵ INV-20261011-021', '2026-10-11 16:14:57'),
(221, 13, 'SALE', NULL, 1.00, 34.00, 33.00, 'SALE', 56, 1, 'فرۆشتنی وەسڵ INV-20261011-021', '2026-10-11 16:14:57'),
(222, 14, 'SALE', NULL, 1.00, 28.00, 27.00, 'SALE', 56, 1, 'فرۆشتنی وەسڵ INV-20261011-021', '2026-10-11 16:14:57'),
(223, 18, 'SALE', NULL, 1.00, 18.00, 17.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(224, 17, 'SALE', NULL, 1.00, 23.00, 22.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(225, 23, 'SALE', NULL, 1.00, 76.00, 75.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(226, 24, 'SALE', NULL, 1.00, 42.00, 41.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(227, 3, 'SALE', NULL, 1.00, 18.00, 17.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(228, 7, 'SALE', NULL, 2.00, 44.00, 42.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(229, 5, 'SALE', NULL, 3.00, 60.00, 57.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(230, 10, 'SALE', NULL, 1.00, 37.00, 36.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(231, 11, 'SALE', NULL, 1.00, 98.00, 97.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(232, 12, 'SALE', NULL, 1.00, 119.00, 118.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(233, 8, 'SALE', NULL, 1.00, 55.00, 54.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(234, 6, 'SALE', NULL, 1.00, 21.00, 20.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(235, 1, 'SALE', NULL, 1.00, 49.00, 48.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(236, 2, 'SALE', NULL, 1.00, 24.00, 23.00, 'SALE', 57, 1, 'فرۆشتنی وەسڵ INV-20261011-022', '2026-10-11 16:56:32'),
(237, 17, 'SALE', NULL, 1.00, 22.00, 21.00, 'SALE', 58, 1, 'فرۆشتنی وەسڵ INV-20261011-023', '2026-10-11 16:57:20'),
(238, 13, 'SALE', NULL, 1.00, 33.00, 32.00, 'SALE', 58, 1, 'فرۆشتنی وەسڵ INV-20261011-023', '2026-10-11 16:57:20'),
(239, 18, 'SALE', NULL, 1.00, 17.00, 16.00, 'SALE', 58, 1, 'فرۆشتنی وەسڵ INV-20261011-023', '2026-10-11 16:57:20'),
(240, 19, 'SALE', NULL, 1.00, 11.00, 10.00, 'SALE', 58, 1, 'فرۆشتنی وەسڵ INV-20261011-023', '2026-10-11 16:57:20'),
(241, 20, 'SALE', NULL, 1.00, 19.00, 18.00, 'SALE', 58, 1, 'فرۆشتنی وەسڵ INV-20261011-023', '2026-10-11 16:57:20'),
(242, 24, 'SALE', NULL, 1.00, 41.00, 40.00, 'SALE', 58, 1, 'فرۆشتنی وەسڵ INV-20261011-023', '2026-10-11 16:57:20'),
(243, 23, 'SALE', NULL, 1.00, 75.00, 74.00, 'SALE', 58, 1, 'فرۆشتنی وەسڵ INV-20261011-023', '2026-10-11 16:57:20'),
(244, 18, 'SALE', NULL, 0.50, 16.00, 15.50, 'SALE', 59, 1, 'فرۆشتنی وەسڵ INV-20261011-024', '2026-10-11 20:00:49'),
(245, 26, 'SALE', NULL, 1.00, 12.00, 11.00, 'SALE', 60, 1, 'فرۆشتنی وەسڵ INV-20261012-001', '2026-10-12 07:43:58'),
(246, 27, 'SALE', NULL, 1.00, 24.00, 23.00, 'SALE', 60, 1, 'فرۆشتنی وەسڵ INV-20261012-001', '2026-10-12 07:43:58'),
(247, 26, 'SALE', NULL, 2.00, 11.00, 9.00, 'SALE', 61, 1, 'فرۆشتنی وەسڵ INV-20261012-002', '2026-10-12 07:49:05'),
(248, 27, 'SALE', NULL, 5.00, 23.00, 18.00, 'SALE', 61, 1, 'فرۆشتنی وەسڵ INV-20261012-002', '2026-10-12 07:49:05'),
(249, 31, 'SALE', NULL, 20.00, 50.00, 30.00, 'SALE', 62, 1, 'فرۆشتنی وەسڵ INV-20261012-003', '2026-10-12 08:23:47'),
(250, 31, 'SALE', NULL, 10.00, 100.00, 90.00, 'SALE', 63, 1, 'فرۆشتنی وەسڵ INV-20261012-004', '2026-10-12 08:24:59'),
(251, 31, 'SALE', NULL, 1.00, 90.00, 89.00, 'SALE', 64, 1, 'فرۆشتنی وەسڵ INV-20261013-001', '2026-10-13 17:01:47'),
(252, 21, 'SALE', NULL, 1.00, 96.00, 95.00, 'SALE', 64, 1, 'فرۆشتنی وەسڵ INV-20261013-001', '2026-10-13 17:01:47');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `company` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `total_purchases` decimal(14,2) NOT NULL DEFAULT '0.00',
  `total_paid` decimal(14,2) NOT NULL DEFAULT '0.00',
  `debt` decimal(14,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `suppliers_name_index` (`name`),
  KEY `suppliers_company_index` (`company`),
  KEY `suppliers_debt_index` (`debt`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `company`, `phone`, `address`, `notes`, `total_purchases`, `total_paid`, `debt`, `created_at`, `updated_at`) VALUES
(3, 'لیز', 'لیز', '07701234567', 'سلێمانیی', '٢٢٢٢', 0.00, 0.00, 0.00, '2026-10-10 15:02:55', '2026-10-11 16:13:30');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
CREATE TABLE IF NOT EXISTS `units` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name_ku` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_en` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_ar` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `short_code` varchar(15) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` bigint UNSIGNED NOT NULL,
  `status` enum('ACTIVE','INACTIVE','SUSPENDED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `language_pref` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ku',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `permissions_customized` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  KEY `users_username_index` (`username`),
  KEY `users_role_id_index` (`role_id`),
  KEY `users_status_index` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role_id`, `status`, `language_pref`, `phone`, `email`, `last_login`, `remember_token`, `created_at`, `updated_at`, `permissions_customized`) VALUES
(1, 'Admin', 'admin', '$2y$12$Z.05zf8X4MJB2FWicuk9oeBQFooyFOqULZM78OfOd4GSlakdvTRa.', 1, 'ACTIVE', 'ku', NULL, NULL, '2026-10-13 17:44:21', NULL, '2026-10-09 19:38:22', '2026-10-13 17:44:21', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
CREATE TABLE IF NOT EXISTS `user_permissions` (
  `user_id` bigint UNSIGNED NOT NULL,
  `permission_id` bigint UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`,`permission_id`),
  KEY `user_permissions_permission_id_foreign` (`permission_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Constraints for table `customer_debt_entries`
--
ALTER TABLE `customer_debt_entries`
  ADD CONSTRAINT `customer_debt_entries_customer_id_foreign` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_debt_entries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT;

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
