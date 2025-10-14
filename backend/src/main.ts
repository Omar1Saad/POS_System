import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // تفعيل CORS للسماح للواجهة الأمامية بالتواصل مع الخلفية
  app.enableCors(); 

  // لا تستخدم app.listen() في بيئة Vercel
  // await app.listen(3000); 

  // هذا السطر مهم جدًا لـ Vercel
  await app.init(); 
  return app.getHttpAdapter().getInstance();
}

// قم بتصدير التطبيق لـ Vercel
export default bootstrap;