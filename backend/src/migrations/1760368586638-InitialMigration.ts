import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1760368586638 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // إنشاء جدول المستخدمين
        await queryRunner.query(`
            CREATE TABLE "users" (
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
            )
        `);

        // إنشاء جدول الفئات
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" SERIAL NOT NULL,
                "name" character varying NOT NULL,
                "description" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
                CONSTRAINT "PK_categories" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول العملاء
        await queryRunner.query(`
            CREATE TABLE "customers" (
                "id" SERIAL NOT NULL,
                "fullName" character varying NOT NULL,
                "phone" character varying,
                "email" character varying,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_customers_phone" UNIQUE ("phone"),
                CONSTRAINT "UQ_customers_email" UNIQUE ("email"),
                CONSTRAINT "PK_customers" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول الموردين
        await queryRunner.query(`
            CREATE TABLE "suppliers" (
                "id" SERIAL NOT NULL,
                "name" character varying(150) NOT NULL,
                "phone" character varying(20),
                "email" character varying(100),
                "address" text NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_suppliers_phone" UNIQUE ("phone"),
                CONSTRAINT "UQ_suppliers_email" UNIQUE ("email"),
                CONSTRAINT "PK_suppliers" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول المنتجات
        await queryRunner.query(`
            CREATE TABLE "Products" (
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
            )
        `);

        // إنشاء جدول المبيعات
        await queryRunner.query(`
            CREATE TABLE "sales" (
                "id" SERIAL NOT NULL,
                "customerId" integer,
                "userId" integer,
                "total" numeric(10,2) NOT NULL DEFAULT '0',
                "profit" numeric(10,2) NOT NULL DEFAULT '0',
                "paymentMethod" character varying NOT NULL DEFAULT 'cash',
                "status" character varying NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sales" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول عناصر المبيعات
        await queryRunner.query(`
            CREATE TABLE "sales_items" (
                "id" SERIAL NOT NULL,
                "saleId" integer NOT NULL,
                "productId" integer NOT NULL,
                "quantity" integer NOT NULL,
                "unitPrice" numeric(10,2) NOT NULL,
                "total" numeric(10,2) NOT NULL,
                "costAtTimeOfSale" numeric(10,2) NOT NULL DEFAULT '0',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_sales_items" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول المشتريات
        await queryRunner.query(`
            CREATE TABLE "purchases" (
                "id" SERIAL NOT NULL,
                "supplierId" integer,
                "userId" integer,
                "total" numeric(10,2) NOT NULL DEFAULT '0',
                "status" character varying NOT NULL DEFAULT 'pending',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_purchases" PRIMARY KEY ("id")
            )
        `);

        // إنشاء جدول عناصر المشتريات
        await queryRunner.query(`
            CREATE TABLE "purchase_items" (
                "id" SERIAL NOT NULL,
                "purchaseId" integer NOT NULL,
                "productId" integer NOT NULL,
                "quantity" integer NOT NULL,
                "unitCost" numeric(10,2) NOT NULL,
                "total" numeric(10,2) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_purchase_items" PRIMARY KEY ("id")
            )
        `);

        // إضافة المفاتيح الخارجية
        await queryRunner.query(`
            ALTER TABLE "Products" 
            ADD CONSTRAINT "FK_Products_categoryId" 
            FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "sales" 
            ADD CONSTRAINT "FK_sales_customerId" 
            FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "sales" 
            ADD CONSTRAINT "FK_sales_userId" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "sales_items" 
            ADD CONSTRAINT "FK_sales_items_saleId" 
            FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "sales_items" 
            ADD CONSTRAINT "FK_sales_items_productId" 
            FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchases" 
            ADD CONSTRAINT "FK_purchases_supplierId" 
            FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchases" 
            ADD CONSTRAINT "FK_purchases_userId" 
            FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchase_items" 
            ADD CONSTRAINT "FK_purchase_items_purchaseId" 
            FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "purchase_items" 
            ADD CONSTRAINT "FK_purchase_items_productId" 
            FOREIGN KEY ("productId") REFERENCES "Products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // حذف المفاتيح الخارجية أولاً
        await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_purchase_items_productId"`);
        await queryRunner.query(`ALTER TABLE "purchase_items" DROP CONSTRAINT "FK_purchase_items_purchaseId"`);
        await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT "FK_purchases_userId"`);
        await queryRunner.query(`ALTER TABLE "purchases" DROP CONSTRAINT "FK_purchases_supplierId"`);
        await queryRunner.query(`ALTER TABLE "sales_items" DROP CONSTRAINT "FK_sales_items_productId"`);
        await queryRunner.query(`ALTER TABLE "sales_items" DROP CONSTRAINT "FK_sales_items_saleId"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_sales_userId"`);
        await queryRunner.query(`ALTER TABLE "sales" DROP CONSTRAINT "FK_sales_customerId"`);
        await queryRunner.query(`ALTER TABLE "Products" DROP CONSTRAINT "FK_Products_categoryId"`);

        // حذف الجداول
        await queryRunner.query(`DROP TABLE "purchase_items"`);
        await queryRunner.query(`DROP TABLE "purchases"`);
        await queryRunner.query(`DROP TABLE "sales_items"`);
        await queryRunner.query(`DROP TABLE "sales"`);
        await queryRunner.query(`DROP TABLE "Products"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
