CREATE DATABASE IF NOT EXISTS `warkop.ayah`;
USE `warkop.ayah`;

-- SQL Berikut akan membuat struktur tabel untuk aplikasi Warkop Ayah --
-- CATATAN: Langkah ini (opsional) karena Flask SQLAlchemy otomatis membuat tabel --
-- saat pertama kali aplikasi dijalankan (`python run.py`) --

CREATE TABLE IF NOT EXISTS `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(64) NOT NULL,
  `password_hash` varchar(256) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
);

CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
);

CREATE TABLE IF NOT EXISTS `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `menus` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `description` text,
  `price` float NOT NULL,
  `google_maps_url` varchar(255) DEFAULT NULL,
  `map_reviews` text,
  `category_id` int NOT NULL,
  `image_id` int DEFAULT NULL,
  `stock` int DEFAULT '0',
  PRIMARY KEY (`id`),
  -- Pastikan Anda memasukkan KEY yang bersesuaian dengan urutan input --
  CONSTRAINT `menus_cat_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `menus_img_fk` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`)
);

-- NOTE: 
-- Akun Default Admin tidak perlu di-insert manual ke dalam SQL.
-- Python backend (app/run.py) telah dimodifikasi untuk membuat username 'admin'
-- dengan password 'admin123' secara otomatis jika database terdeteksi masih kosong.
