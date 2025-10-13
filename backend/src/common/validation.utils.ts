import { Repository, ObjectLiteral } from 'typeorm';
import { ConflictException } from '@nestjs/common';

export class ValidationUtils {
  static async validateUniqueField<T extends ObjectLiteral>(
    repository: Repository<T>,
    field: string,
    value: string | number,
    excludeId?: number,
    entityName: string = 'Entity'
  ): Promise<void> {
    const whereCondition: any = { [field]: value };
    
    const existingEntity = await repository.findOne({ where: whereCondition });
    
    if (existingEntity && (excludeId === undefined || (existingEntity as any).id !== excludeId)) {
      throw new ConflictException(`${entityName} with this ${field} already exists`);
    }
  }

  static async validateEntityExists<T extends ObjectLiteral>(
    repository: Repository<T>,
    id: number,
    entityName: string = 'Entity'
  ): Promise<T> {
    const entity = await repository.findOne({ where: { id } as any });
    if (!entity) {
      throw new Error(`${entityName} not found!`);
    }
    return entity;
  }
}
