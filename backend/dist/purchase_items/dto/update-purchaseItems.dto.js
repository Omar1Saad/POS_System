"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePurchaseItemsDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_purchaseItems_dto_1 = require("./create-purchaseItems.dto");
class UpdatePurchaseItemsDto extends (0, mapped_types_1.PartialType)(create_purchaseItems_dto_1.CreatePurchaseItemsDto) {
}
exports.UpdatePurchaseItemsDto = UpdatePurchaseItemsDto;
//# sourceMappingURL=update-purchaseItems.dto.js.map