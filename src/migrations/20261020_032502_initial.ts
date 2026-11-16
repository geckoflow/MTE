import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`products_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`value\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_specs_order_idx\` ON \`products_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_specs_parent_id_idx\` ON \`products_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_included\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`item\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_included_order_idx\` ON \`products_included\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_included_parent_id_idx\` ON \`products_included\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_layers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`view\` text DEFAULT 'seite' NOT NULL,
  	\`z\` numeric DEFAULT 10,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_layers_order_idx\` ON \`products_layers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_layers_parent_id_idx\` ON \`products_layers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_layers_image_idx\` ON \`products_layers\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_base_layers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`view\` text DEFAULT 'seite',
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_base_layers_order_idx\` ON \`products_base_layers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_base_layers_parent_id_idx\` ON \`products_base_layers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_base_layers_image_idx\` ON \`products_base_layers\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_option_groups_options_layers\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`view\` text DEFAULT 'seite',
  	\`z\` numeric DEFAULT 10,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_option_groups_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_option_groups_options_layers_order_idx\` ON \`products_option_groups_options_layers\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_option_groups_options_layers_parent_id_idx\` ON \`products_option_groups_options_layers\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_option_groups_options_layers_image_idx\` ON \`products_option_groups_options_layers\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_option_groups_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`label\` text,
  	\`description\` text,
  	\`price\` numeric DEFAULT 0,
  	\`available\` integer DEFAULT true,
  	\`is_default\` integer DEFAULT false,
  	\`visual\` text DEFAULT 'none',
  	\`color\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_option_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_option_groups_options_order_idx\` ON \`products_option_groups_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_option_groups_options_parent_id_idx\` ON \`products_option_groups_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_option_groups_options_image_idx\` ON \`products_option_groups_options\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_option_groups_text_fonts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`label\` text,
  	\`font\` text DEFAULT 'antiqua',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_option_groups\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_option_groups_text_fonts_order_idx\` ON \`products_option_groups_text_fonts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_option_groups_text_fonts_parent_id_idx\` ON \`products_option_groups_text_fonts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_option_groups\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`label\` text,
  	\`step\` text DEFAULT 'schaft',
  	\`kind\` text DEFAULT 'single',
  	\`required\` integer DEFAULT false,
  	\`help\` text,
  	\`text_price\` numeric DEFAULT 0,
  	\`text_max_length\` numeric DEFAULT 24,
  	\`text_placeholder\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_option_groups_order_idx\` ON \`products_option_groups\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_option_groups_parent_id_idx\` ON \`products_option_groups\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`name\` text NOT NULL,
  	\`type\` text DEFAULT 'zubehoer' NOT NULL,
  	\`tagline\` text,
  	\`description\` text,
  	\`price\` numeric DEFAULT 0 NOT NULL,
  	\`price_from\` integer DEFAULT false,
  	\`price_note\` text,
  	\`available\` integer DEFAULT true,
  	\`featured\` integer DEFAULT false,
  	\`lead_time\` text,
  	\`illustration\` text DEFAULT 'none',
  	\`configurable\` integer DEFAULT false,
  	\`base_label\` text DEFAULT 'Grundpreis',
  	\`text_area_x\` numeric DEFAULT 40,
  	\`text_area_y\` numeric DEFAULT 42,
  	\`text_area_width\` numeric DEFAULT 30,
  	\`text_area_rotate\` numeric DEFAULT 0,
  	\`slug\` text,
  	\`published\` integer DEFAULT true,
  	\`sort_order\` numeric DEFAULT 100,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`products_type_idx\` ON \`products\` (\`type\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_published_idx\` ON \`products\` (\`published\`);`)
  await db.run(sql`CREATE INDEX \`products_meta_meta_image_idx\` ON \`products\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`products_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_texts_order_parent\` ON \`products_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_rels_order_idx\` ON \`products_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_parent_idx\` ON \`products_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_path_idx\` ON \`products_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_media_id_idx\` ON \`products_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_products_id_idx\` ON \`products_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE TABLE \`configurations_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`detail\` text,
  	\`amount\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`configurations\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`configurations_lines_order_idx\` ON \`configurations_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`configurations_lines_parent_id_idx\` ON \`configurations_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`configurations\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`code\` text NOT NULL,
  	\`product_id\` integer,
  	\`product_name\` text,
  	\`total\` numeric,
  	\`selection\` text,
  	\`vat_mode\` text,
  	\`vat_rate\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`configurations_code_idx\` ON \`configurations\` (\`code\`);`)
  await db.run(sql`CREATE INDEX \`configurations_product_idx\` ON \`configurations\` (\`product_id\`);`)
  await db.run(sql`CREATE INDEX \`configurations_updated_at_idx\` ON \`configurations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`configurations_created_at_idx\` ON \`configurations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`inquiries\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`status\` text DEFAULT 'neu' NOT NULL,
  	\`topic\` text DEFAULT 'allgemein' NOT NULL,
  	\`name\` text NOT NULL,
  	\`email\` text NOT NULL,
  	\`phone\` text,
  	\`organisation\` text,
  	\`message\` text,
  	\`configuration_id\` integer,
  	\`internal_notes\` text,
  	\`consent_at\` text,
  	\`source_path\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`configuration_id\`) REFERENCES \`configurations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`inquiries_status_idx\` ON \`inquiries\` (\`status\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_configuration_idx\` ON \`inquiries\` (\`configuration_id\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_updated_at_idx\` ON \`inquiries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`inquiries_created_at_idx\` ON \`inquiries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`faqs\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`question\` text NOT NULL,
  	\`answer\` text NOT NULL,
  	\`category\` text DEFAULT 'allgemein',
  	\`show_on_home\` integer DEFAULT false,
  	\`published\` integer DEFAULT true,
  	\`sort_order\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`faqs_published_idx\` ON \`faqs\` (\`published\`);`)
  await db.run(sql`CREATE INDEX \`faqs_updated_at_idx\` ON \`faqs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`faqs_created_at_idx\` ON \`faqs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`gallery\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`image_id\` integer NOT NULL,
  	\`description\` text,
  	\`year\` numeric,
  	\`published\` integer DEFAULT true,
  	\`sort_order\` numeric DEFAULT 100,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`gallery_image_idx\` ON \`gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`gallery_published_idx\` ON \`gallery\` (\`published\`);`)
  await db.run(sql`CREATE INDEX \`gallery_updated_at_idx\` ON \`gallery\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`gallery_created_at_idx\` ON \`gallery\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`legal_pages\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`title\` text NOT NULL,
  	\`content\` text NOT NULL,
  	\`show_in_footer\` integer DEFAULT true,
  	\`slug\` text,
  	\`published\` integer DEFAULT true,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`legal_pages_slug_idx\` ON \`legal_pages\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`legal_pages_published_idx\` ON \`legal_pages\` (\`published\`);`)
  await db.run(sql`CREATE INDEX \`legal_pages_meta_meta_image_idx\` ON \`legal_pages\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`legal_pages_updated_at_idx\` ON \`legal_pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`legal_pages_created_at_idx\` ON \`legal_pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`credit\` text,
  	\`placeholder\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumb_url\` text,
  	\`sizes_thumb_width\` numeric,
  	\`sizes_thumb_height\` numeric,
  	\`sizes_thumb_mime_type\` text,
  	\`sizes_thumb_filesize\` numeric,
  	\`sizes_thumb_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_large_url\` text,
  	\`sizes_large_width\` numeric,
  	\`sizes_large_height\` numeric,
  	\`sizes_large_mime_type\` text,
  	\`sizes_large_filesize\` numeric,
  	\`sizes_large_filename\` text,
  	\`sizes_og_url\` text,
  	\`sizes_og_width\` numeric,
  	\`sizes_og_height\` numeric,
  	\`sizes_og_mime_type\` text,
  	\`sizes_og_filesize\` numeric,
  	\`sizes_og_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumb_sizes_thumb_filename_idx\` ON \`media\` (\`sizes_thumb_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_og_sizes_og_filename_idx\` ON \`media\` (\`sizes_og_filename\`);`)
  await db.run(sql`CREATE TABLE \`users_roles\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_roles_order_idx\` ON \`users_roles\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_roles_parent_idx\` ON \`users_roles\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`name\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`configurations_id\` integer,
  	\`inquiries_id\` integer,
  	\`faqs_id\` integer,
  	\`gallery_id\` integer,
  	\`legal_pages_id\` integer,
  	\`media_id\` integer,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`configurations_id\`) REFERENCES \`configurations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`inquiries_id\`) REFERENCES \`inquiries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`faqs_id\`) REFERENCES \`faqs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`gallery_id\`) REFERENCES \`gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`legal_pages_id\`) REFERENCES \`legal_pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_configurations_id_idx\` ON \`payload_locked_documents_rels\` (\`configurations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_inquiries_id_idx\` ON \`payload_locked_documents_rels\` (\`inquiries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_faqs_id_idx\` ON \`payload_locked_documents_rels\` (\`faqs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_gallery_id_idx\` ON \`payload_locked_documents_rels\` (\`gallery_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_legal_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`legal_pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`homepage_hero_lines\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	\`outline\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_hero_lines_order_idx\` ON \`homepage_hero_lines\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_hero_lines_parent_id_idx\` ON \`homepage_hero_lines\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_hero_facts\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_hero_facts_order_idx\` ON \`homepage_hero_facts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_hero_facts_parent_id_idx\` ON \`homepage_hero_facts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_marquee\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`word\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_marquee_order_idx\` ON \`homepage_marquee\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_marquee_parent_id_idx\` ON \`homepage_marquee\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_quality_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_quality_items_order_idx\` ON \`homepage_quality_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_quality_items_parent_id_idx\` ON \`homepage_quality_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`hero_eyebrow\` text,
  	\`hero_lead\` text,
  	\`hero_primary_label\` text,
  	\`hero_primary_href\` text,
  	\`hero_secondary_label\` text,
  	\`hero_secondary_href\` text,
  	\`hero_image_id\` integer,
  	\`hero_video_id\` integer,
  	\`manufaktur_eyebrow\` text,
  	\`manufaktur_heading\` text,
  	\`manufaktur_heading_accent\` text,
  	\`manufaktur_intro\` text,
  	\`manufaktur_body\` text,
  	\`manufaktur_quote\` text,
  	\`quality_eyebrow\` text,
  	\`quality_heading\` text,
  	\`quality_heading_accent\` text,
  	\`quality_lead\` text,
  	\`contrast_line_one\` text,
  	\`contrast_line_two\` text,
  	\`contrast_left_label\` text,
  	\`contrast_right_label\` text,
  	\`contrast_left_text\` text,
  	\`contrast_right_text\` text,
  	\`products_eyebrow\` text,
  	\`products_heading\` text,
  	\`products_heading_accent\` text,
  	\`products_lead\` text,
  	\`configurator_eyebrow\` text,
  	\`configurator_heading\` text,
  	\`configurator_heading_accent\` text,
  	\`configurator_lead\` text,
  	\`unikat_eyebrow\` text,
  	\`unikat_heading\` text,
  	\`unikat_heading_accent\` text,
  	\`unikat_text\` text,
  	\`unikat_image_id\` integer,
  	\`contact_eyebrow\` text,
  	\`contact_heading\` text,
  	\`contact_heading_accent\` text,
  	\`contact_lead\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`unikat_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_hero_hero_image_idx\` ON \`homepage\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_hero_hero_video_idx\` ON \`homepage\` (\`hero_video_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_unikat_unikat_image_idx\` ON \`homepage\` (\`unikat_image_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_meta_meta_image_idx\` ON \`homepage\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_rels_order_idx\` ON \`homepage_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_parent_idx\` ON \`homepage_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_path_idx\` ON \`homepage_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_media_id_idx\` ON \`homepage_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`craft_steps\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`craft\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`craft_steps_order_idx\` ON \`craft_steps\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`craft_steps_parent_id_idx\` ON \`craft_steps\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`craft_steps_image_idx\` ON \`craft_steps\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`craft_materials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`text\` text NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`craft\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`craft_materials_order_idx\` ON \`craft_materials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`craft_materials_parent_id_idx\` ON \`craft_materials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`craft_materials_image_idx\` ON \`craft_materials\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`craft\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`eyebrow\` text,
  	\`heading\` text,
  	\`heading_accent\` text,
  	\`lead\` text,
  	\`story_heading\` text,
  	\`story_heading_accent\` text,
  	\`story_body\` text,
  	\`story_image_id\` integer,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`story_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`craft_story_story_image_idx\` ON \`craft\` (\`story_image_id\`);`)
  await db.run(sql`CREATE INDEX \`craft_meta_meta_image_idx\` ON \`craft\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE TABLE \`settings_social\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`network\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_social_order_idx\` ON \`settings_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`settings_social_parent_id_idx\` ON \`settings_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`settings\` (
  	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  	\`brand_name\` text DEFAULT 'Schaftböller Ebner' NOT NULL,
  	\`legal_name\` text,
  	\`contact_person\` text DEFAULT 'David Ebner',
  	\`street\` text,
  	\`zip\` text,
  	\`city\` text DEFAULT 'Oberalm',
  	\`region\` text DEFAULT 'Salzburg',
  	\`phone\` text,
  	\`email\` text,
  	\`opening_note\` text DEFAULT 'Besuche in der Werkstatt nach Terminvereinbarung.',
  	\`inquiry_recipient\` text,
  	\`show_prices\` integer DEFAULT true,
  	\`vat_mode\` text DEFAULT 'regel' NOT NULL,
  	\`vat_rate\` numeric DEFAULT 20,
  	\`lead_time_note\` text DEFAULT 'Fertigung auf Bestellung, Lieferzeit nach Vereinbarung.',
  	\`inquiry_note\` text DEFAULT 'Die Anfrage ist unverbindlich. Wir melden uns mit einem Angebot und einem Liefertermin.',
  	\`intro_enabled\` integer DEFAULT true,
  	\`intro_tagline\` text DEFAULT 'Handwerk mit Tradition',
  	\`preview_banner\` integer DEFAULT false,
  	\`footer_note\` text DEFAULT 'Handgefertigte Schaftböller aus Oberalm, Salzburg.',
  	\`default_og_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`default_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_default_og_image_idx\` ON \`settings\` (\`default_og_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`products_specs\`;`)
  await db.run(sql`DROP TABLE \`products_included\`;`)
  await db.run(sql`DROP TABLE \`products_layers\`;`)
  await db.run(sql`DROP TABLE \`products_base_layers\`;`)
  await db.run(sql`DROP TABLE \`products_option_groups_options_layers\`;`)
  await db.run(sql`DROP TABLE \`products_option_groups_options\`;`)
  await db.run(sql`DROP TABLE \`products_option_groups_text_fonts\`;`)
  await db.run(sql`DROP TABLE \`products_option_groups\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`DROP TABLE \`products_texts\`;`)
  await db.run(sql`DROP TABLE \`products_rels\`;`)
  await db.run(sql`DROP TABLE \`configurations_lines\`;`)
  await db.run(sql`DROP TABLE \`configurations\`;`)
  await db.run(sql`DROP TABLE \`inquiries\`;`)
  await db.run(sql`DROP TABLE \`faqs\`;`)
  await db.run(sql`DROP TABLE \`gallery\`;`)
  await db.run(sql`DROP TABLE \`legal_pages\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`users_roles\`;`)
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`homepage_hero_lines\`;`)
  await db.run(sql`DROP TABLE \`homepage_hero_facts\`;`)
  await db.run(sql`DROP TABLE \`homepage_marquee\`;`)
  await db.run(sql`DROP TABLE \`homepage_quality_items\`;`)
  await db.run(sql`DROP TABLE \`homepage\`;`)
  await db.run(sql`DROP TABLE \`homepage_rels\`;`)
  await db.run(sql`DROP TABLE \`craft_steps\`;`)
  await db.run(sql`DROP TABLE \`craft_materials\`;`)
  await db.run(sql`DROP TABLE \`craft\`;`)
  await db.run(sql`DROP TABLE \`settings_social\`;`)
  await db.run(sql`DROP TABLE \`settings\`;`)
}
