import { Repository, ObjectLiteral } from 'typeorm';
export declare class ValidationUtils {
    static validateUniqueField<T extends ObjectLiteral>(repository: Repository<T>, field: string, value: string | number, excludeId?: number, entityName?: string): Promise<void>;
    static validateEntityExists<T extends ObjectLiteral>(repository: Repository<T>, id: number, entityName?: string): Promise<T>;
}
