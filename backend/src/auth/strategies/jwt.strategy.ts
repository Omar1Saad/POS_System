import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/users/user.services';

// Ensure consistent JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
}
  
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private usersService: UserService) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: JWT_SECRET,
      });
    }
  
    async validate(payload: JwtPayload) {
      try {

        // First validate the payload structure
        if (!payload.sub || !payload.email || !payload.role) {
          console.error('Invalid token payload:', payload);
          throw new UnauthorizedException('Invalid token payload');
        }

        // Try to get user from database
        const user = await this.usersService.getUserById(payload.sub);
        
        if (!user) {
          // If user not found in database, return the payload data instead
          // This allows the token to still be valid even if user is deleted
          console.warn(`User with ID ${payload.sub} not found in database, using token payload`);
          return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            fullName: payload.email.split('@')[0], // fallback name
            username: payload.email.split('@')[0], // fallback username
          };
        }
        
        return user;
      } catch (error) {
        console.error('JWT validation error:', error);
        throw new UnauthorizedException('Token validation failed');
      }
    }
}