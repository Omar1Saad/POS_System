"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const passport_jwt_1 = require("passport-jwt");
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const user_services_1 = require("../../users/user.services");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'jwt') {
    usersService;
    constructor(usersService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: JWT_SECRET,
        });
        this.usersService = usersService;
    }
    async validate(payload) {
        try {
            if (!payload.sub || !payload.email || !payload.role) {
                console.error('Invalid token payload:', payload);
                throw new common_1.UnauthorizedException('Invalid token payload');
            }
            const user = await this.usersService.getUserById(payload.sub);
            if (!user) {
                console.warn(`User with ID ${payload.sub} not found in database, using token payload`);
                return {
                    id: payload.sub,
                    email: payload.email,
                    role: payload.role,
                    fullName: payload.email.split('@')[0],
                    username: payload.email.split('@')[0],
                };
            }
            return user;
        }
        catch (error) {
            console.error('JWT validation error:', error);
            throw new common_1.UnauthorizedException('Token validation failed');
        }
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_services_1.UserService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map