"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Products = void 0;
const category_entity_1 = require("../../categories/entities/category.entity");
const purchaseItems_entity_1 = require("../../purchase_items/entities/purchaseItems.entity");
const salesItems_entity_1 = require("../../sales_items/entities/salesItems.entity");
const typeorm_1 = require("typeorm");
let Products = class Products {
    id;
    name;
    barcode;
    categoryId;
    price;
    stock;
    averageCost;
    profitPercentage;
    createAt;
    updateAt;
    category;
    salesItems;
    purchaseItems;
};
exports.Products = Products;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Products.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, type: "varchar", length: 150 }),
    __metadata("design:type", String)
], Products.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Products.prototype, "barcode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: true }),
    __metadata("design:type", Number)
], Products.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Products.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0 }),
    __metadata("design:type", Number)
], Products.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 10, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], Products.prototype, "averageCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 5, scale: 2, default: 25.00 }),
    __metadata("design:type", Number)
], Products.prototype, "profitPercentage", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Products.prototype, "createAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Products.prototype, "updateAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, category => category.products, { onDelete: 'SET NULL', nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'categoryId' }),
    __metadata("design:type", category_entity_1.Category)
], Products.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => salesItems_entity_1.SalesItems, salesItems => salesItems.product),
    __metadata("design:type", Array)
], Products.prototype, "salesItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => purchaseItems_entity_1.PurchaseItems, purchaseItems => purchaseItems.product),
    __metadata("design:type", Array)
], Products.prototype, "purchaseItems", void 0);
exports.Products = Products = __decorate([
    (0, typeorm_1.Entity)('Products')
], Products);
//# sourceMappingURL=product.entity.js.map