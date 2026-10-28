CREATE TYPE "public"."business_expense_category" AS ENUM('rent', 'utilities', 'internet', 'marketing', 'equipment', 'repairs', 'transportation', 'salaries', 'subscriptions', 'other');--> statement-breakpoint
CREATE TYPE "public"."order_expense_category" AS ENUM('fabric', 'lining', 'accessories', 'labour', 'embroidery', 'delivery', 'packaging', 'transportation', 'other');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('new', 'in_progress', 'ready', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('transfer', 'cash', 'card', 'other');--> statement-breakpoint
CREATE TABLE "business_expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" "business_expense_category" NOT NULL,
	"description" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" char(3) DEFAULT 'NGN' NOT NULL,
	"expense_date" date NOT NULL,
	"vendor" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "business_expenses_amount_not_negative" CHECK ("business_expenses"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"phone_number" text,
	"email" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "customers_id_user_id_unique" UNIQUE("id","user_id")
);
--> statement-breakpoint
CREATE TABLE "order_expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"order_id" text NOT NULL,
	"category" "order_expense_category" NOT NULL,
	"description" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" char(3) DEFAULT 'NGN' NOT NULL,
	"expense_date" date NOT NULL,
	"vendor" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_expenses_amount_not_negative" CHECK ("order_expenses"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "order_status" DEFAULT 'new' NOT NULL,
	"currency" char(3) DEFAULT 'NGN' NOT NULL,
	"amount_charged" bigint NOT NULL,
	"order_date" date NOT NULL,
	"due_date" date,
	"delivered_at" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_id_user_id_unique" UNIQUE("id","user_id"),
	CONSTRAINT "orders_amount_charged_not_negative" CHECK ("orders"."amount_charged" >= 0)
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"order_id" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" char(3) DEFAULT 'NGN' NOT NULL,
	"payment_date" date NOT NULL,
	"payment_method" "payment_method",
	"reference" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payments_amount_positive" CHECK ("payments"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "business_expenses" ADD CONSTRAINT "business_expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_expenses" ADD CONSTRAINT "order_expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_expenses" ADD CONSTRAINT "order_expenses_order_fk" FOREIGN KEY ("order_id","user_id") REFERENCES "public"."orders"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_fk" FOREIGN KEY ("customer_id","user_id") REFERENCES "public"."customers"("id","user_id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_fk" FOREIGN KEY ("order_id","user_id") REFERENCES "public"."orders"("id","user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "business_expenses_user_id_expense_date_idx" ON "business_expenses" USING btree ("user_id","expense_date");--> statement-breakpoint
CREATE INDEX "customers_user_id_idx" ON "customers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "order_expenses_order_id_idx" ON "order_expenses" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_user_id_order_date_idx" ON "orders" USING btree ("user_id","order_date");--> statement-breakpoint
CREATE INDEX "orders_user_id_status_idx" ON "orders" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payments_user_id_payment_date_idx" ON "payments" USING btree ("user_id","payment_date");