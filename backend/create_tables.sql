-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "fullName" character varying NOT NULL,
    "username" character varying NOT NULL,
    "email" character varying NOT NULL,
    "role" character varying NOT NULL DEFAULT 'cashier',
    "password" character varying NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_users_username" UNIQUE ("username"),
    CONSTRAINT "UQ_users_email" UNIQUE ("email"),
    CONSTRAINT "PK_users" PRIMARY KEY ("id")
);

-- إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS "categories" (
    "id" SERIAL NOT NULL,
    "name" character varying NOT NULL,
    "description" text NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
    CONSTRAINT "PK_categories" PRIMARY KEY ("id")
);

-- إنشاء جدول العملاء
CREATE TABLE IF NOT EXISTS "customer" (
    "id" SERIAL NOT NULL,
    "name" character varying NOT NULL,
    "phone" character varying NOT NULL,
    "email" character varying,
    "address" text,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_customer" PRIMARY KEY ("id")
);

-- إنشاء جدول الموردين
CREATE TABLE IF NOT EXISTS "suppliers" (
    "id" SERIAL NOT NULL,
    "name" character varying NOT NULL,
    "contactPerson" character varying NOT NULL,
    "phone" character varying NOT NULL,
    "email" character varying NOT NULL,
    "address" text NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
);

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS "Products" (
    "id" SERIAL NOT NULL,
    "name" character varying(150) NOT NULL,
    "barcode" character varying(50),
    "categoryId" integer,
    "price" numeric(10,2) NOT NULL,
    "stock" integer NOT NULL DEFAULT '0',
    "averageCost" numeric(10,2) NOT NULL DEFAULT '0',
    "profitPercentage" numeric(5,2) NOT NULL DEFAULT '25.00',
    "createAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updateAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "UQ_Products_name" UNIQUE ("name"),
    CONSTRAINT "UQ_Products_barcode" UNIQUE ("barcode"),
    CONSTRAINT "PK_Products" PRIMARY KEY ("id")
);

-- إنشاء جدول المبيعات
CREATE TABLE IF NOT EXISTS "sales" (
    "id" SERIAL NOT NULL,
    "customerId" integer,
    "userId" integer NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    "discount" numeric(10,2) NOT NULL DEFAULT '0',
    "tax" numeric(10,2) NOT NULL DEFAULT '0',
    "status" character varying NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_sales" PRIMARY KEY ("id")
);

-- إنشاء جدول عناصر المبيعات
CREATE TABLE IF NOT EXISTS "sales_items" (
    "id" SERIAL NOT NULL,
    "saleId" integer NOT NULL,
    "productId" integer NOT NULL,
    "quantity" integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_sales_items" PRIMARY KEY ("id")
);

-- إنشاء جدول المشتريات
CREATE TABLE IF NOT EXISTS "purchases" (
    "id" SERIAL NOT NULL,
    "supplierId" integer,
    "userId" integer NOT NULL,
    "totalAmount" numeric(10,2) NOT NULL,
    "status" character varying NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_purchases" PRIMARY KEY ("id")
);

-- إنشاء جدول عناصر المشتريات
CREATE TABLE IF NOT EXISTS "purchase_items" (
    "id" SERIAL NOT NULL,
    "purchaseId" integer NOT NULL,
    "productId" integer NOT NULL,
    "quantity" integer NOT NULL,
    "unitPrice" numeric(10,2) NOT NULL,
    "totalPrice" numeric(10,2) NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_purchase_items" PRIMARY KEY ("id")
);

-- إضافة المفاتيح الخارجية
ALTER TABLE "Products" 
ADD CONSTRAINT "FK_Products_categoryId" 
FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "sales" 
ADD CONSTRAINT "FK_sales_customerId" 
FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "sales" 
ADD CONSTRAINT "FK_sales_userId" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "sales_items" 
ADD CONSTRAINT "FK_sales_items_saleId" 
FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "sales_items" 
ADD CONSTRAINT "FK_sales_items_productId" 
FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "purchases" 
ADD CONSTRAINT "FK_purchases_supplierId" 
FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "purchases" 
ADD CONSTRAINT "FK_purchases_userId" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE "purchase_items" 
ADD CONSTRAINT "FK_purchase_items_purchaseId" 
FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "purchase_items" 
ADD CONSTRAINT "FK_purchase_items_productId" 
FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
