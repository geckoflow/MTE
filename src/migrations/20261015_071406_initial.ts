import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_layers_view" AS ENUM('seite', 'detail');
  CREATE TYPE "public"."enum_products_base_layers_view" AS ENUM('seite', 'detail');
  CREATE TYPE "public"."enum_products_option_groups_options_layers_view" AS ENUM('seite', 'detail');
  CREATE TYPE "public"."enum_products_option_groups_options_visual" AS ENUM('none', 'holz-natur', 'holz-dunkel', 'holz-maser', 'riemen', 'motiv-rosette', 'motiv-edelweiss', 'motiv-eichenlaub', 'beschuss');
  CREATE TYPE "public"."enum_products_option_groups_text_fonts_font" AS ENUM('antiqua', 'fraktur', 'schreibschrift', 'modern');
  CREATE TYPE "public"."enum_products_option_groups_step" AS ENUM('modell', 'schaft', 'gestaltung', 'zubehoer');
  CREATE TYPE "public"."enum_products_option_groups_kind" AS ENUM('single', 'multi', 'text', 'accessories');
  CREATE TYPE "public"."enum_products_type" AS ENUM('schaftboeller', 'zubehoer', 'personalisierung');
  CREATE TYPE "public"."enum_products_illustration" AS ENUM('none', 'staender', 'hammer', 'ladestock');
  CREATE TYPE "public"."enum_inquiries_status" AS ENUM('neu', 'in_bearbeitung', 'angebot', 'gewonnen', 'abgeschlossen', 'verloren');
  CREATE TYPE "public"."enum_inquiries_topic" AS ENUM('konfiguration', 'allgemein', 'sonderwunsch', 'verein', 'termin');
  CREATE TYPE "public"."enum_faqs_category" AS ENUM('allgemein', 'kauf', 'personalisierung', 'pflege', 'recht');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'redaktion');
  CREATE TYPE "public"."enum_settings_social_network" AS ENUM('instagram', 'facebook', 'youtube', 'tiktok');
  CREATE TYPE "public"."enum_settings_vat_mode" AS ENUM('regel', 'kleinunternehmer');
  CREATE TABLE "products_specs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "products_included" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar NOT NULL
  );
  
  CREATE TABLE "products_layers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_products_layers_view" DEFAULT 'seite' NOT NULL,
  	"z" numeric DEFAULT 10,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "products_base_layers" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_products_base_layers_view" DEFAULT 'seite',
  	"image_id" integer
  );
  
  CREATE TABLE "products_option_groups_options_layers" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"view" "enum_products_option_groups_options_layers_view" DEFAULT 'seite',
  	"z" numeric DEFAULT 10,
  	"image_id" integer
  );
  
  CREATE TABLE "products_option_groups_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"description" varchar,
  	"price" numeric DEFAULT 0,
  	"available" boolean DEFAULT true,
  	"is_default" boolean DEFAULT false,
  	"visual" "enum_products_option_groups_options_visual" DEFAULT 'none',
  	"color" varchar,
  	"image_id" integer
  );
  
  CREATE TABLE "products_option_groups_text_fonts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"font" "enum_products_option_groups_text_fonts_font" DEFAULT 'antiqua'
  );
  
  CREATE TABLE "products_option_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"label" varchar,
  	"step" "enum_products_option_groups_step" DEFAULT 'schaft',
  	"kind" "enum_products_option_groups_kind" DEFAULT 'single',
  	"required" boolean DEFAULT false,
  	"help" varchar,
  	"text_price" numeric DEFAULT 0,
  	"text_max_length" numeric DEFAULT 24,
  	"text_placeholder" varchar
  );
  
  CREATE TABLE "products" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"type" "enum_products_type" DEFAULT 'zubehoer' NOT NULL,
  	"tagline" varchar,
  	"description" jsonb,
  	"price" numeric DEFAULT 0 NOT NULL,
  	"price_from" boolean DEFAULT false,
  	"price_note" varchar,
  	"available" boolean DEFAULT true,
  	"featured" boolean DEFAULT false,
  	"lead_time" varchar,
  	"illustration" "enum_products_illustration" DEFAULT 'none',
  	"configurable" boolean DEFAULT false,
  	"base_label" varchar DEFAULT 'Grundpreis',
  	"text_area_x" numeric DEFAULT 40,
  	"text_area_y" numeric DEFAULT 42,
  	"text_area_width" numeric DEFAULT 30,
  	"text_area_rotate" numeric DEFAULT 0,
  	"slug" varchar,
  	"published" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "products_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "products_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer,
  	"products_id" integer
  );
  
  CREATE TABLE "configurations_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"detail" varchar,
  	"amount" numeric
  );
  
  CREATE TABLE "configurations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"product_id" integer,
  	"product_name" varchar,
  	"total" numeric,
  	"selection" jsonb,
  	"vat_mode" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "inquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_inquiries_status" DEFAULT 'neu' NOT NULL,
  	"topic" "enum_inquiries_topic" DEFAULT 'allgemein' NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"organisation" varchar,
  	"message" varchar,
  	"configuration_id" integer,
  	"internal_notes" varchar,
  	"consent_at" timestamp(3) with time zone,
  	"source_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"category" "enum_faqs_category" DEFAULT 'allgemein',
  	"show_on_home" boolean DEFAULT false,
  	"published" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "gallery" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"description" varchar,
  	"year" numeric,
  	"published" boolean DEFAULT true,
  	"sort_order" numeric DEFAULT 100,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "legal_pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"show_in_footer" boolean DEFAULT true,
  	"slug" varchar,
  	"published" boolean DEFAULT true,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"credit" varchar,
  	"placeholder" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_large_url" varchar,
  	"sizes_large_width" numeric,
  	"sizes_large_height" numeric,
  	"sizes_large_mime_type" varchar,
  	"sizes_large_filesize" numeric,
  	"sizes_large_filename" varchar,
  	"sizes_og_url" varchar,
  	"sizes_og_width" numeric,
  	"sizes_og_height" numeric,
  	"sizes_og_mime_type" varchar,
  	"sizes_og_filesize" numeric,
  	"sizes_og_filename" varchar
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer,
  	"configurations_id" integer,
  	"inquiries_id" integer,
  	"faqs_id" integer,
  	"gallery_id" integer,
  	"legal_pages_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_hero_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"outline" boolean DEFAULT false
  );
  
  CREATE TABLE "homepage_hero_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_marquee" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"word" varchar NOT NULL
  );
  
  CREATE TABLE "homepage_quality_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "homepage" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"hero_eyebrow" varchar,
  	"hero_lead" varchar,
  	"hero_primary_label" varchar,
  	"hero_primary_href" varchar,
  	"hero_secondary_label" varchar,
  	"hero_secondary_href" varchar,
  	"hero_image_id" integer,
  	"hero_video_id" integer,
  	"manufaktur_eyebrow" varchar,
  	"manufaktur_heading" varchar,
  	"manufaktur_heading_accent" varchar,
  	"manufaktur_intro" varchar,
  	"manufaktur_body" jsonb,
  	"manufaktur_quote" varchar,
  	"quality_eyebrow" varchar,
  	"quality_heading" varchar,
  	"quality_heading_accent" varchar,
  	"quality_lead" varchar,
  	"contrast_line_one" varchar,
  	"contrast_line_two" varchar,
  	"contrast_left_label" varchar,
  	"contrast_right_label" varchar,
  	"contrast_left_text" varchar,
  	"contrast_right_text" varchar,
  	"products_eyebrow" varchar,
  	"products_heading" varchar,
  	"products_heading_accent" varchar,
  	"products_lead" varchar,
  	"configurator_eyebrow" varchar,
  	"configurator_heading" varchar,
  	"configurator_heading_accent" varchar,
  	"configurator_lead" varchar,
  	"unikat_eyebrow" varchar,
  	"unikat_heading" varchar,
  	"unikat_heading_accent" varchar,
  	"unikat_text" varchar,
  	"unikat_image_id" integer,
  	"contact_eyebrow" varchar,
  	"contact_heading" varchar,
  	"contact_heading_accent" varchar,
  	"contact_lead" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "homepage_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "craft_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "craft_materials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "craft" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"heading_accent" varchar,
  	"lead" varchar,
  	"story_heading" varchar,
  	"story_heading_accent" varchar,
  	"story_body" jsonb,
  	"story_image_id" integer,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "settings_social" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"network" "enum_settings_social_network" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name" varchar DEFAULT 'Schaftböller Ebner' NOT NULL,
  	"legal_name" varchar,
  	"contact_person" varchar DEFAULT 'David Ebner',
  	"street" varchar,
  	"zip" varchar,
  	"city" varchar DEFAULT 'Oberalm',
  	"region" varchar DEFAULT 'Salzburg',
  	"phone" varchar,
  	"email" varchar,
  	"opening_note" varchar DEFAULT 'Besuche in der Werkstatt nach Terminvereinbarung.',
  	"inquiry_recipient" varchar,
  	"show_prices" boolean DEFAULT true,
  	"vat_mode" "enum_settings_vat_mode" DEFAULT 'regel' NOT NULL,
  	"vat_rate" numeric DEFAULT 20,
  	"lead_time_note" varchar DEFAULT 'Fertigung auf Bestellung, Lieferzeit nach Vereinbarung.',
  	"inquiry_note" varchar DEFAULT 'Die Anfrage ist unverbindlich. Wir melden uns mit einem Angebot und einem Liefertermin.',
  	"intro_enabled" boolean DEFAULT true,
  	"intro_tagline" varchar DEFAULT 'Handwerk mit Tradition',
  	"preview_banner" boolean DEFAULT false,
  	"footer_note" varchar DEFAULT 'Handgefertigte Schaftböller aus Oberalm, Salzburg.',
  	"default_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "products_specs" ADD CONSTRAINT "products_specs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_included" ADD CONSTRAINT "products_included_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_layers" ADD CONSTRAINT "products_layers_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_layers" ADD CONSTRAINT "products_layers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_base_layers" ADD CONSTRAINT "products_base_layers_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_base_layers" ADD CONSTRAINT "products_base_layers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_option_groups_options_layers" ADD CONSTRAINT "products_option_groups_options_layers_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_option_groups_options_layers" ADD CONSTRAINT "products_option_groups_options_layers_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_option_groups_options"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_option_groups_options" ADD CONSTRAINT "products_option_groups_options_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_option_groups_options" ADD CONSTRAINT "products_option_groups_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_option_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_option_groups_text_fonts" ADD CONSTRAINT "products_option_groups_text_fonts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products_option_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_option_groups" ADD CONSTRAINT "products_option_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products" ADD CONSTRAINT "products_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "products_texts" ADD CONSTRAINT "products_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurations_lines" ADD CONSTRAINT "configurations_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."configurations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "configurations" ADD CONSTRAINT "configurations_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_configuration_id_configurations_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."configurations"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "gallery" ADD CONSTRAINT "gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "legal_pages" ADD CONSTRAINT "legal_pages_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_configurations_fk" FOREIGN KEY ("configurations_id") REFERENCES "public"."configurations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_inquiries_fk" FOREIGN KEY ("inquiries_id") REFERENCES "public"."inquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_gallery_fk" FOREIGN KEY ("gallery_id") REFERENCES "public"."gallery"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_legal_pages_fk" FOREIGN KEY ("legal_pages_id") REFERENCES "public"."legal_pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_hero_lines" ADD CONSTRAINT "homepage_hero_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_hero_facts" ADD CONSTRAINT "homepage_hero_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_marquee" ADD CONSTRAINT "homepage_marquee_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_quality_items" ADD CONSTRAINT "homepage_quality_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_hero_video_id_media_id_fk" FOREIGN KEY ("hero_video_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_unikat_image_id_media_id_fk" FOREIGN KEY ("unikat_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_rels" ADD CONSTRAINT "homepage_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "craft_steps" ADD CONSTRAINT "craft_steps_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "craft_steps" ADD CONSTRAINT "craft_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."craft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "craft_materials" ADD CONSTRAINT "craft_materials_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "craft_materials" ADD CONSTRAINT "craft_materials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."craft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "craft" ADD CONSTRAINT "craft_story_image_id_media_id_fk" FOREIGN KEY ("story_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "craft" ADD CONSTRAINT "craft_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "settings_social" ADD CONSTRAINT "settings_social_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "settings" ADD CONSTRAINT "settings_default_og_image_id_media_id_fk" FOREIGN KEY ("default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_specs_order_idx" ON "products_specs" USING btree ("_order");
  CREATE INDEX "products_specs_parent_id_idx" ON "products_specs" USING btree ("_parent_id");
  CREATE INDEX "products_included_order_idx" ON "products_included" USING btree ("_order");
  CREATE INDEX "products_included_parent_id_idx" ON "products_included" USING btree ("_parent_id");
  CREATE INDEX "products_layers_order_idx" ON "products_layers" USING btree ("_order");
  CREATE INDEX "products_layers_parent_id_idx" ON "products_layers" USING btree ("_parent_id");
  CREATE INDEX "products_layers_image_idx" ON "products_layers" USING btree ("image_id");
  CREATE INDEX "products_base_layers_order_idx" ON "products_base_layers" USING btree ("_order");
  CREATE INDEX "products_base_layers_parent_id_idx" ON "products_base_layers" USING btree ("_parent_id");
  CREATE INDEX "products_base_layers_image_idx" ON "products_base_layers" USING btree ("image_id");
  CREATE INDEX "products_option_groups_options_layers_order_idx" ON "products_option_groups_options_layers" USING btree ("_order");
  CREATE INDEX "products_option_groups_options_layers_parent_id_idx" ON "products_option_groups_options_layers" USING btree ("_parent_id");
  CREATE INDEX "products_option_groups_options_layers_image_idx" ON "products_option_groups_options_layers" USING btree ("image_id");
  CREATE INDEX "products_option_groups_options_order_idx" ON "products_option_groups_options" USING btree ("_order");
  CREATE INDEX "products_option_groups_options_parent_id_idx" ON "products_option_groups_options" USING btree ("_parent_id");
  CREATE INDEX "products_option_groups_options_image_idx" ON "products_option_groups_options" USING btree ("image_id");
  CREATE INDEX "products_option_groups_text_fonts_order_idx" ON "products_option_groups_text_fonts" USING btree ("_order");
  CREATE INDEX "products_option_groups_text_fonts_parent_id_idx" ON "products_option_groups_text_fonts" USING btree ("_parent_id");
  CREATE INDEX "products_option_groups_order_idx" ON "products_option_groups" USING btree ("_order");
  CREATE INDEX "products_option_groups_parent_id_idx" ON "products_option_groups" USING btree ("_parent_id");
  CREATE INDEX "products_type_idx" ON "products" USING btree ("type");
  CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");
  CREATE INDEX "products_published_idx" ON "products" USING btree ("published");
  CREATE INDEX "products_meta_meta_image_idx" ON "products" USING btree ("meta_image_id");
  CREATE INDEX "products_updated_at_idx" ON "products" USING btree ("updated_at");
  CREATE INDEX "products_created_at_idx" ON "products" USING btree ("created_at");
  CREATE INDEX "products_texts_order_parent" ON "products_texts" USING btree ("order","parent_id");
  CREATE INDEX "products_rels_order_idx" ON "products_rels" USING btree ("order");
  CREATE INDEX "products_rels_parent_idx" ON "products_rels" USING btree ("parent_id");
  CREATE INDEX "products_rels_path_idx" ON "products_rels" USING btree ("path");
  CREATE INDEX "products_rels_media_id_idx" ON "products_rels" USING btree ("media_id");
  CREATE INDEX "products_rels_products_id_idx" ON "products_rels" USING btree ("products_id");
  CREATE INDEX "configurations_lines_order_idx" ON "configurations_lines" USING btree ("_order");
  CREATE INDEX "configurations_lines_parent_id_idx" ON "configurations_lines" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "configurations_code_idx" ON "configurations" USING btree ("code");
  CREATE INDEX "configurations_product_idx" ON "configurations" USING btree ("product_id");
  CREATE INDEX "configurations_updated_at_idx" ON "configurations" USING btree ("updated_at");
  CREATE INDEX "configurations_created_at_idx" ON "configurations" USING btree ("created_at");
  CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status");
  CREATE INDEX "inquiries_configuration_idx" ON "inquiries" USING btree ("configuration_id");
  CREATE INDEX "inquiries_updated_at_idx" ON "inquiries" USING btree ("updated_at");
  CREATE INDEX "inquiries_created_at_idx" ON "inquiries" USING btree ("created_at");
  CREATE INDEX "faqs_published_idx" ON "faqs" USING btree ("published");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "gallery_image_idx" ON "gallery" USING btree ("image_id");
  CREATE INDEX "gallery_published_idx" ON "gallery" USING btree ("published");
  CREATE INDEX "gallery_updated_at_idx" ON "gallery" USING btree ("updated_at");
  CREATE INDEX "gallery_created_at_idx" ON "gallery" USING btree ("created_at");
  CREATE UNIQUE INDEX "legal_pages_slug_idx" ON "legal_pages" USING btree ("slug");
  CREATE INDEX "legal_pages_published_idx" ON "legal_pages" USING btree ("published");
  CREATE INDEX "legal_pages_meta_meta_image_idx" ON "legal_pages" USING btree ("meta_image_id");
  CREATE INDEX "legal_pages_updated_at_idx" ON "legal_pages" USING btree ("updated_at");
  CREATE INDEX "legal_pages_created_at_idx" ON "legal_pages" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_large_sizes_large_filename_idx" ON "media" USING btree ("sizes_large_filename");
  CREATE INDEX "media_sizes_og_sizes_og_filename_idx" ON "media" USING btree ("sizes_og_filename");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_products_id_idx" ON "payload_locked_documents_rels" USING btree ("products_id");
  CREATE INDEX "payload_locked_documents_rels_configurations_id_idx" ON "payload_locked_documents_rels" USING btree ("configurations_id");
  CREATE INDEX "payload_locked_documents_rels_inquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("inquiries_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_gallery_id_idx" ON "payload_locked_documents_rels" USING btree ("gallery_id");
  CREATE INDEX "payload_locked_documents_rels_legal_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("legal_pages_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "homepage_hero_lines_order_idx" ON "homepage_hero_lines" USING btree ("_order");
  CREATE INDEX "homepage_hero_lines_parent_id_idx" ON "homepage_hero_lines" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_facts_order_idx" ON "homepage_hero_facts" USING btree ("_order");
  CREATE INDEX "homepage_hero_facts_parent_id_idx" ON "homepage_hero_facts" USING btree ("_parent_id");
  CREATE INDEX "homepage_marquee_order_idx" ON "homepage_marquee" USING btree ("_order");
  CREATE INDEX "homepage_marquee_parent_id_idx" ON "homepage_marquee" USING btree ("_parent_id");
  CREATE INDEX "homepage_quality_items_order_idx" ON "homepage_quality_items" USING btree ("_order");
  CREATE INDEX "homepage_quality_items_parent_id_idx" ON "homepage_quality_items" USING btree ("_parent_id");
  CREATE INDEX "homepage_hero_hero_image_idx" ON "homepage" USING btree ("hero_image_id");
  CREATE INDEX "homepage_hero_hero_video_idx" ON "homepage" USING btree ("hero_video_id");
  CREATE INDEX "homepage_unikat_unikat_image_idx" ON "homepage" USING btree ("unikat_image_id");
  CREATE INDEX "homepage_meta_meta_image_idx" ON "homepage" USING btree ("meta_image_id");
  CREATE INDEX "homepage_rels_order_idx" ON "homepage_rels" USING btree ("order");
  CREATE INDEX "homepage_rels_parent_idx" ON "homepage_rels" USING btree ("parent_id");
  CREATE INDEX "homepage_rels_path_idx" ON "homepage_rels" USING btree ("path");
  CREATE INDEX "homepage_rels_media_id_idx" ON "homepage_rels" USING btree ("media_id");
  CREATE INDEX "craft_steps_order_idx" ON "craft_steps" USING btree ("_order");
  CREATE INDEX "craft_steps_parent_id_idx" ON "craft_steps" USING btree ("_parent_id");
  CREATE INDEX "craft_steps_image_idx" ON "craft_steps" USING btree ("image_id");
  CREATE INDEX "craft_materials_order_idx" ON "craft_materials" USING btree ("_order");
  CREATE INDEX "craft_materials_parent_id_idx" ON "craft_materials" USING btree ("_parent_id");
  CREATE INDEX "craft_materials_image_idx" ON "craft_materials" USING btree ("image_id");
  CREATE INDEX "craft_story_story_image_idx" ON "craft" USING btree ("story_image_id");
  CREATE INDEX "craft_meta_meta_image_idx" ON "craft" USING btree ("meta_image_id");
  CREATE INDEX "settings_social_order_idx" ON "settings_social" USING btree ("_order");
  CREATE INDEX "settings_social_parent_id_idx" ON "settings_social" USING btree ("_parent_id");
  CREATE INDEX "settings_default_og_image_idx" ON "settings" USING btree ("default_og_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_specs" CASCADE;
  DROP TABLE "products_included" CASCADE;
  DROP TABLE "products_layers" CASCADE;
  DROP TABLE "products_base_layers" CASCADE;
  DROP TABLE "products_option_groups_options_layers" CASCADE;
  DROP TABLE "products_option_groups_options" CASCADE;
  DROP TABLE "products_option_groups_text_fonts" CASCADE;
  DROP TABLE "products_option_groups" CASCADE;
  DROP TABLE "products" CASCADE;
  DROP TABLE "products_texts" CASCADE;
  DROP TABLE "products_rels" CASCADE;
  DROP TABLE "configurations_lines" CASCADE;
  DROP TABLE "configurations" CASCADE;
  DROP TABLE "inquiries" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "gallery" CASCADE;
  DROP TABLE "legal_pages" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "homepage_hero_lines" CASCADE;
  DROP TABLE "homepage_hero_facts" CASCADE;
  DROP TABLE "homepage_marquee" CASCADE;
  DROP TABLE "homepage_quality_items" CASCADE;
  DROP TABLE "homepage" CASCADE;
  DROP TABLE "homepage_rels" CASCADE;
  DROP TABLE "craft_steps" CASCADE;
  DROP TABLE "craft_materials" CASCADE;
  DROP TABLE "craft" CASCADE;
  DROP TABLE "settings_social" CASCADE;
  DROP TABLE "settings" CASCADE;
  DROP TYPE "public"."enum_products_layers_view";
  DROP TYPE "public"."enum_products_base_layers_view";
  DROP TYPE "public"."enum_products_option_groups_options_layers_view";
  DROP TYPE "public"."enum_products_option_groups_options_visual";
  DROP TYPE "public"."enum_products_option_groups_text_fonts_font";
  DROP TYPE "public"."enum_products_option_groups_step";
  DROP TYPE "public"."enum_products_option_groups_kind";
  DROP TYPE "public"."enum_products_type";
  DROP TYPE "public"."enum_products_illustration";
  DROP TYPE "public"."enum_inquiries_status";
  DROP TYPE "public"."enum_inquiries_topic";
  DROP TYPE "public"."enum_faqs_category";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_settings_social_network";
  DROP TYPE "public"."enum_settings_vat_mode";`)
}
