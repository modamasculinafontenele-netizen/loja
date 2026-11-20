import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(), name: text("name").notNull(), slug: text("slug").notNull().unique(),
  sku: text("sku").notNull().unique(), description: text("description").notNull().default(""),
  category: text("category").notNull(), price: real("price").notNull(), promoPrice: real("promo_price"),
  costPrice: real("cost_price").notNull().default(0), imageUrl: text("image_url").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const variants = sqliteTable("variants", {
  id: text("id").primaryKey(), productId: text("product_id").notNull().references(() => products.id),
  size: text("size").notNull(), color: text("color").notNull(), stockQty: integer("stock_qty").notNull().default(0),
  reservedQty: integer("reserved_qty").notNull().default(0), minStock: integer("min_stock").notNull().default(3),
});
export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey(), productId: text("product_id").notNull().references(() => products.id),
  imageUrl: text("image_url").notNull(), position: integer("position").notNull().default(0),
});
export const storeSettings = sqliteTable("store_settings", {
  id: text("id").primaryKey(), storeName: text("store_name").notNull().default("Atelier Verde"),
  phone: text("phone").notNull().default(""), whatsapp: text("whatsapp").notNull().default(""),
  instagram: text("instagram").notNull().default(""), address: text("address").notNull().default(""),
  defaultMinStock: integer("default_min_stock").notNull().default(3), logoUrl: text("logo_url").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(), orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(), customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"), deliveryMode: text("delivery_mode").notNull().default("retirada"),
  address: text("address"), notes: text("notes"), paymentMethod: text("payment_method").notNull().default("pix"),
  status: text("status").notNull().default("aguardando_analise"), total: real("total").notNull(),
  reservationExpiresAt: text("reservation_expires_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`), updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id),
  productId: text("product_id").references(() => products.id, { onDelete: "set null" }), variantId: text("variant_id").references(() => variants.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(), size: text("size").notNull(), color: text("color").notNull(),
  quantity: integer("quantity").notNull(), unitPrice: real("unit_price").notNull(), subtotal: real("subtotal").notNull(),
});
export const stockMovements = sqliteTable("stock_movements", {
  id: text("id").primaryKey(), variantId: text("variant_id").notNull().references(() => variants.id),
  type: text("type").notNull(), quantity: integer("quantity").notNull(), reason: text("reason").notNull(),
  actor: text("actor").notNull().default("sistema"), createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
export const orderHistory = sqliteTable("order_history", {
  id: text("id").primaryKey(), orderId: text("order_id").notNull().references(() => orders.id),
  fromStatus: text("from_status"), toStatus: text("to_status").notNull(), actor: text("actor").notNull().default("sistema"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
