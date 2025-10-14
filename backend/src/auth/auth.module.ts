import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.services';
import { UserModule } from 'src/users/user.module';
  
  @Module({
    imports: [
      UserModule,
      PassportModule.register({ defaultStrategy: 'jwt' }),
      JwtModule.register({
        secret: process.env.JWT_SECRET || 'your-secret-key',
        signOptions: { 
          expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
        },
      }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule],
  })
  export class AuthModule {}