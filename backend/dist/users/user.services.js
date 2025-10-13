"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const bcrypt = __importStar(require("bcrypt"));
const common_1 = require("@nestjs/common");
const typeorm_2 = require("@nestjs/typeorm");
let UserService = class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async createUser(createUserDto) {
        const { fullName, username, email, password, role } = createUserDto;
        const userExists = await this.userRepository.findOne({ where: { username } });
        if (userExists) {
            throw new common_1.BadRequestException('Username already exists');
        }
        const emailExists = await this.userRepository.findOne({ where: { email } });
        if (emailExists) {
            throw new common_1.BadRequestException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            fullName,
            username,
            email,
            password: hashedPassword,
            role: role ?? user_entity_1.UserRole.CASHIER,
        });
        return this.userRepository.save(user);
    }
    async getUsers(paginationResponse) {
        const { page, limit } = paginationResponse;
        const skip = (page - 1) * limit;
        const take = limit;
        const [users, total] = await this.userRepository.findAndCount({ skip, take });
        return {
            data: users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getUserById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async getByEmail(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        return user;
    }
    async updateUser(id, updateUserDto) {
        const { username, email } = updateUserDto;
        await this.validateUniqueFields(id, username, email);
        const user = await this.getUserById(id);
        this.updateUserFields(user, updateUserDto);
        return this.userRepository.save(user);
    }
    async validateUniqueFields(id, username, email) {
        if (username) {
            const userExists = await this.userRepository.findOne({ where: { username } });
            if (userExists && userExists.id !== +id) {
                throw new common_1.BadRequestException('Username already exists');
            }
        }
        if (email) {
            const emailExists = await this.userRepository.findOne({ where: { email } });
            if (emailExists && emailExists.id !== +id) {
                throw new common_1.BadRequestException('Email already exists');
            }
        }
    }
    async updateUserFields(user, updateUserDto) {
        const { fullName, username, email, password, role } = updateUserDto;
        if (fullName)
            user.fullName = fullName;
        if (username)
            user.username = username;
        if (email)
            user.email = email;
        if (password)
            user.password = await bcrypt.hash(password, 10);
        if (role)
            user.role = role;
    }
    async updatePassword(id, hashedNewPassword) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException("User not found!");
        }
        user.password = hashedNewPassword;
        return this.userRepository.save(user);
    }
    async deleteBulk(ids) {
        const users = await this.userRepository.findBy({ id: (0, typeorm_1.In)(ids) });
        if (users.length !== ids.length) {
            throw new common_1.NotFoundException("One or more users not found!");
        }
        await this.userRepository.delete(ids);
        return { 'message': 'Users deleted successfully!' };
    }
    async delete(id) {
        const userExists = await this.userRepository.findOne({ where: { id } });
        if (!userExists) {
            throw new common_1.NotFoundException('User not found!');
        }
        await this.userRepository.delete(id);
        return { "success": "User deleted successfully!" };
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    __param(0, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], UserService);
//# sourceMappingURL=user.services.js.map