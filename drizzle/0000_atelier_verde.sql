CREATE TABLE `products` (
  `id` text PRIMARY KEY NOT NULL, `name` text NOT NULL, `slug` text NOT NULL, `sku` text NOT NULL,
  `description` text DEFAULT '' NOT NULL, `category` text NOT NULL, `price` real NOT NULL, `promo_price` real,
  `cost_price` real DEFAULT 0 NOT NULL, `image_url` text NOT NULL, `active` integer DEFAULT 1 NOT NULL,
  `featured` integer DEFAULT 0 NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_sku_unique` ON `products` (`sku`);
--> statement-breakpoint
CREATE TABLE `variants` (
  `id` text PRIMARY KEY NOT NULL, `product_id` text NOT NULL, `size` text NOT NULL, `color` text NOT NULL,
  `stock_qty` integer DEFAULT 0 NOT NULL, `reserved_qty` integer DEFAULT 0 NOT NULL, `min_stock` integer DEFAULT 3 NOT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `variants_product_size_color_unique` ON `variants` (`product_id`,`size`,`color`);
--> statement-breakpoint
CREATE TRIGGER `variants_stock_guard_insert` BEFORE INSERT ON `variants` WHEN NEW.stock_qty < 0 OR NEW.reserved_qty < 0 OR NEW.reserved_qty > NEW.stock_qty BEGIN SELECT RAISE(ABORT, 'invalid_stock'); END;
--> statement-breakpoint
CREATE TRIGGER `variants_stock_guard_update` BEFORE UPDATE ON `variants` WHEN NEW.stock_qty < 0 OR NEW.reserved_qty < 0 OR NEW.reserved_qty > NEW.stock_qty BEGIN SELECT RAISE(ABORT, 'invalid_stock'); END;
--> statement-breakpoint
CREATE TABLE `orders` (
  `id` text PRIMARY KEY NOT NULL, `order_number` text NOT NULL, `customer_name` text NOT NULL, `customer_phone` text NOT NULL,
  `customer_email` text, `delivery_mode` text DEFAULT 'retirada' NOT NULL, `address` text, `notes` text,
  `payment_method` text DEFAULT 'pix' NOT NULL, `status` text DEFAULT 'aguardando_analise' NOT NULL,
  `total` real NOT NULL, `reservation_expires_at` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL, `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);
--> statement-breakpoint
CREATE TABLE `order_items` (
  `id` text PRIMARY KEY NOT NULL, `order_id` text NOT NULL, `product_id` text NOT NULL, `variant_id` text NOT NULL,
  `product_name` text NOT NULL, `size` text NOT NULL, `color` text NOT NULL, `quantity` integer NOT NULL,
  `unit_price` real NOT NULL, `subtotal` real NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`), FOREIGN KEY (`product_id`) REFERENCES `products`(`id`), FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`)
);
--> statement-breakpoint
CREATE TABLE `stock_movements` (
  `id` text PRIMARY KEY NOT NULL, `variant_id` text NOT NULL, `type` text NOT NULL, `quantity` integer NOT NULL,
  `reason` text NOT NULL, `actor` text DEFAULT 'sistema' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_history` (
  `id` text PRIMARY KEY NOT NULL, `order_id` text NOT NULL, `from_status` text, `to_status` text NOT NULL,
  `actor` text DEFAULT 'sistema' NOT NULL, `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
);
