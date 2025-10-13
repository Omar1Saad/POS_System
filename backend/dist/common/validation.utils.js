"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = void 0;
const common_1 = require("@nestjs/common");
class ValidationUtils {
    static async validateUniqueField(repository, field, value, excludeId, entityName = 'Entity') {
        const whereCondition = { [field]: value };
        const existingEntity = await repository.findOne({ where: whereCondition });
        if (existingEntity && (excludeId === undefined || existingEntity.id !== excludeId)) {
            throw new common_1.ConflictException(`${entityName} with this ${field} already exists`);
        }
    }
    static async validateEntityExists(repository, id, entityName = 'Entity') {
        const entity = await repository.findOne({ where: { id } });
        if (!entity) {
            throw new Error(`${entityName} not found!`);
        }
        return entity;
    }
}
exports.ValidationUtils = ValidationUtils;
//# sourceMappingURL=validation.utils.js.map