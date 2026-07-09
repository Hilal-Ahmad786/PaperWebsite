CREATE TYPE "public"."flagged_ip_status" AS ENUM('watching', 'flagged', 'excluded', 'whitelisted');--> statement-breakpoint
CREATE TABLE "ad_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"gclid" text,
	"gbraid" text,
	"wbraid" text,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"referrer" text,
	"landing_page" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_term" text,
	"utm_content" text,
	"session_id" text,
	"fingerprint_hash" text,
	"screen" text,
	"timezone" text,
	"language" text,
	"platform" text,
	"hardware_concurrency" integer,
	"has_canvas" boolean,
	"time_on_page" integer,
	"mouse_moved" boolean,
	"max_scroll_depth" integer,
	"click_count" integer DEFAULT 0 NOT NULL,
	"converted" boolean DEFAULT false NOT NULL,
	"is_datacenter" boolean,
	"is_vpn" boolean,
	"is_proxy" boolean,
	"country" text,
	"isp" text,
	"fraud_score" integer DEFAULT 0 NOT NULL,
	"fraud_reasons" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'succeeded' NOT NULL,
	"payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "flagged_ips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"total_clicks" integer DEFAULT 0 NOT NULL,
	"total_conversions" integer DEFAULT 0 NOT NULL,
	"fraud_score" integer DEFAULT 0 NOT NULL,
	"reasons" jsonb,
	"first_seen" timestamp with time zone,
	"last_seen" timestamp with time zone,
	"status" "flagged_ip_status" DEFAULT 'watching' NOT NULL,
	"manually_reviewed" boolean DEFAULT false NOT NULL,
	"notes" text,
	"is_datacenter" boolean,
	"is_vpn" boolean,
	"is_proxy" boolean,
	"country" text,
	"isp" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ip_intel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ip_address" text NOT NULL,
	"provider" text NOT NULL,
	"is_datacenter" boolean DEFAULT false NOT NULL,
	"is_vpn" boolean DEFAULT false NOT NULL,
	"is_proxy" boolean DEFAULT false NOT NULL,
	"country" text,
	"isp" text,
	"raw" jsonb,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "ad_visits_ip_idx" ON "ad_visits" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "ad_visits_gclid_idx" ON "ad_visits" USING btree ("gclid");--> statement-breakpoint
CREATE UNIQUE INDEX "ad_visits_session_uniq" ON "ad_visits" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "ad_visits_fingerprint_idx" ON "ad_visits" USING btree ("fingerprint_hash");--> statement-breakpoint
CREATE INDEX "ad_visits_created_idx" ON "ad_visits" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ad_visits_score_idx" ON "ad_visits" USING btree ("fraud_score");--> statement-breakpoint
CREATE INDEX "background_jobs_type_idx" ON "background_jobs" USING btree ("type");--> statement-breakpoint
CREATE INDEX "background_jobs_created_idx" ON "background_jobs" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "flagged_ips_ip_idx" ON "flagged_ips" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "flagged_ips_status_idx" ON "flagged_ips" USING btree ("status");--> statement-breakpoint
CREATE INDEX "flagged_ips_score_idx" ON "flagged_ips" USING btree ("fraud_score");--> statement-breakpoint
CREATE INDEX "flagged_ips_last_seen_idx" ON "flagged_ips" USING btree ("last_seen");--> statement-breakpoint
CREATE UNIQUE INDEX "ip_intel_ip_idx" ON "ip_intel" USING btree ("ip_address");--> statement-breakpoint
CREATE INDEX "ip_intel_fetched_idx" ON "ip_intel" USING btree ("fetched_at");