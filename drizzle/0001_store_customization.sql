CREATE TABLE `product_images` (
  `id` text PRIMARY KEY NOT NULL,
  `product_id` text NOT NULL,
  `image_url` text NOT NULL,
  `position` integer DEFAULT 0 NOT NULL,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `store_settings` (
  `id` text PRIMARY KEY NOT NULL,
  `store_name` text DEFAULT 'Atelier Verde' NOT NULL,
  `phone` text DEFAULT '' NOT NULL,
  `whatsapp` text DEFAULT '' NOT NULL,
  `instagram` text DEFAULT '' NOT NULL,
  `address` text DEFAULT '' NOT NULL,
  `default_min_stock` integer DEFAULT 3 NOT NULL,
  `logo_url` text DEFAULT '' NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
