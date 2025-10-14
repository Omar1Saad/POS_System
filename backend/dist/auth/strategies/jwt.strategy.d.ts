import { Strategy } from 'passport-jwt';
import { UserService } from 'src/users/user.services';
export interface JwtPayload {
    sub: number;
    email: string;
    role: string;
}
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    constructor(usersService: UserService);
    validate(payload: JwtPayload): Promise<import("../../users/entities/user.entity").User | {
        id: number;
        email: string;
        role: string;
        fullName: string;
        username: string;
    }>;
}
export {};
