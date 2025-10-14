import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// إنشاء التطبيق للاستخدام مع Vercel
let app: any;

async function createApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    
    // إعداد CORS للعمل مع Vercel
    app.enableCors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
          'http://localhost:5173', 
          'http://localhost:5174', 
          'http://localhost:5175', 
          'http://localhost:5176',
          'http://localhost:3000',
          'http://localhost:3001',
        ];
        
        // Check if origin is allowed or is a Vercel domain
        if (allowedOrigins.includes(origin) || 
            origin.includes('.vercel.app') || 
            origin.includes('localhost')) {
          return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
    });

    // إعداد التطبيق للعمل مع Vercel
    await app.init();
  }
  return app;
}

// تصدير التطبيق للاستخدام مع Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  
  const nestApp = await createApp();
  return nestApp.getHttpAdapter().getInstance()(req, res);
}

// للاستخدام المحلي فقط
if (process.env.NODE_ENV !== 'production') {
  async function bootstrap() {
    
    const app = await NestFactory.create(AppModule);
    
    app.enableCors({
      origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        'http://localhost:5175', 
        'http://localhost:5176',
      ],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
    });
    
  }
  bootstrap();
}
