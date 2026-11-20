--> statement-breakpoint
CREATE TABLE `order_items_new` (
  `id` text PRIMARY KEY NOT NULL, `order_id` text NOT NULL, `product_id` text, `variant_id` text,
  `product_name` text NOT NULL, `size` text NOT NULL, `color` text NOT NULL, `quantity` integer NOT NULL,
  `unit_price` real NOT NULL, `subtotal` real NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`variant_id`) REFERENCES `variants`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `order_items_new` (`id`,`order_id`,`product_id`,`variant_id`,`product_name`,`size`,`color`,`quantity`,`unit_price`,`subtotal`)
SELECT `id`,`order_id`,`product_id`,`variant_id`,`product_name`,`size`,`color`,`quantity`,`unit_price`,`subtotal` FROM `order_items`;
--> statement-breakpoint
DROP TABLE `order_items`;
--> statement-breakpoint
ALTER TABLE `order_items_new` RENAME TO `order_items`;
--> statement-breakpoint
