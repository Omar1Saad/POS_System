"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
let app;
async function createApp() {
    if (!app) {
        app = await core_1.NestFactory.create(app_module_1.AppModule);
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin)
                    return callback(null, true);
                const allowedOrigins = [
                    'http://localhost:5173',
                    'http://localhost:5174',
                    'http://localhost:5175',
                    'http://localhost:5176',
                    'http://localhost:3000',
                    'http://localhost:3001',
                ];
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
        await app.init();
    }
    return app;
}
async function handler(req, res) {
    const nestApp = await createApp();
    return nestApp.getHttpAdapter().getInstance()(req, res);
}
if (process.env.NODE_ENV !== 'production') {
    async function bootstrap() {
        const app = await core_1.NestFactory.create(app_module_1.AppModule);
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
        await app.listen(process.env.PORT ?? 3000);
    }
    bootstrap();
}
//# sourceMappingURL=main.js.map