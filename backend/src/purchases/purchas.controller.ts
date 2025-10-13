import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CreatePurchasesDto } from "./dto/create-purchases.dto";
import { UpdatePurchasesDto } from "./dto/update-purchases.dto";
import { PurchaseService } from "./purchas.services";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/users/entities/user.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard)
@Controller('purchases')
export class PurchasController {
    constructor( private readonly purchaseService: PurchaseService ) {}
    
    @Post()
    create(@Body() createPurchasesDto: CreatePurchasesDto, @Req() req) {
        const user = req.user ;
        return this.purchaseService.createPurchase(createPurchasesDto, user);
    }

    @Get()
    findAll(
        @Req() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page:number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit:number,
        @Query('search') search?: string,
        @Query('status') status?: string,
    ) {
        const user = req.user ;
        return this.purchaseService.getPurchases(user, {page, limit, search, status});
    }

    @Get('summary')
    getSummary(@Query('period') period: string = 'month') {
        return this.purchaseService.getSummary(period);
    }
    
    @Get(':id')
    findOne(@Param('id') id: number, @Req() req) {
        const user = req.user ;
        return this.purchaseService.getPurchaseById(id, user);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updatePurchaseesDto: UpdatePurchasesDto, @Req() req) {
        const user = req.user ;
        return this.purchaseService.updatePurchase(id, updatePurchaseesDto, user);
    }

    @Delete('/bulk')
    async deleteBulk(@Body('ids') ids:number[]){
        return this.purchaseService.deleteBulk(ids)
    }

    @Delete(':id')
    remove(@Param('id') id: number, @Req() req) {
        const user = req.user ;
        return this.purchaseService.delete(id, user);
    }

    @Patch(':id/complete')
    complete(@Param('id') id: number, @Req() req) {
        const user = req.user;
        return this.purchaseService.completePurchase(id, user);
    }

    @Patch(':id/cancel')
    cancel(@Param('id') id: number, @Req() req) {
        const user = req.user;
        return this.purchaseService.cancelPurchase(id, user);
    }
}