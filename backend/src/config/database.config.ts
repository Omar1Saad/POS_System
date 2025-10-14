import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

// تحميل متغيرات البيئة
config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [
    'dist/**/entities/*.entity.js'
  ],
  migrations: [
    'src/migrations/*{.ts,.js}',
    'dist/migrations/*{.ts,.js}'
  ],
  synchronize: false,
  logging: true,
  ssl: {
    rejectUnauthorized: false,
  },
});
