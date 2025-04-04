import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  profilePicture: text("profile_picture"),
  university: text("university"),
  yearLevel: text("year_level"),
  isAnonymousSeller: boolean("is_anonymous_seller").default(false),
  phoneNumber: text("phone_number"),
  whatsappNumber: text("whatsapp_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Product Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull(),
});

// Products model
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  condition: text("condition").notNull(),
  images: text("images").array().notNull(),
  location: text("location"),
  isBidding: boolean("is_bidding").default(false),
  isSold: boolean("is_sold").default(false),
  isFeatured: boolean("is_featured").default(false),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bids model
export const bids = pgTable("bids", {
  id: serial("id").primaryKey(),
  amount: integer("amount").notNull(), // Bid amount in cents
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isAccepted: boolean("is_accepted").default(false),
});

// Purchases/Transactions model
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  amount: integer("amount").notNull(), // Final amount in cents
  receipt: jsonb("receipt"), // PDF receipt data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Messages model
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  productId: integer("product_id").references(() => products.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Bulk Sales model
export const bulkSales = pgTable("bulk_sales", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  discount: integer("discount"), // Percentage discount
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// BulkSaleProducts - products included in a bulk sale
export const bulkSaleProducts = pgTable("bulk_sale_products", {
  id: serial("id").primaryKey(),
  bulkSaleId: integer("bulk_sale_id").notNull().references(() => bulkSales.id),
  productId: integer("product_id").notNull().references(() => products.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertBulkSaleSchema = createInsertSchema(bulkSales).omit({
  id: true,
  createdAt: true,
});

export const insertBulkSaleProductSchema = createInsertSchema(bulkSaleProducts).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type BulkSale = typeof bulkSales.$inferSelect;
export type InsertBulkSale = z.infer<typeof insertBulkSaleSchema>;

export type BulkSaleProduct = typeof bulkSaleProducts.$inferSelect;
export type InsertBulkSaleProduct = z.infer<typeof insertBulkSaleProductSchema>;
