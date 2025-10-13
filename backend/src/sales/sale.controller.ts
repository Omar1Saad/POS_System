import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CreateSaleDto } from "./dto/create-sale.dto";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { SaleService } from "./sale.services";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/users/entities/user.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";


@UseGuards(JwtAuthGuard)
@Controller('sales')
export class SaleController {
    constructor( private readonly saleService: SaleService ) {}
    
    @Post()
    create(@Body() createSaleDto: CreateSaleDto, @Req() req) {
        const user = req.user ;
        return this.saleService.createSale(createSaleDto, user);
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
        return this.saleService.getSales(user, {page, limit, search, status});
    }

    @Get('summary')
    getSummary(@Query('period') period: string = 'month', @Req() req) {
        const user = req.user;
        return this.saleService.getSummary(period, user);
    }
    
    @Get(':id')
    findOne(@Param('id') id: number, @Req() req) {
        const user = req.user ;
        return this.saleService.getSaleById(id, user);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updateSaleDto: UpdateSaleDto, @Req() req) {
        const user = req.user ;
        return this.saleService.updateSale(id, updateSaleDto, user);
    }

    @Delete('/bulk')
    removeBulk(@Body('ids') ids:number[]){
        return this.saleService.deleteBulk(ids);
    }
    
    @Delete(':id')
    remove(@Param('id') id: number, @Req() req) {
        const user = req.user ;
        return this.saleService.delete(id, user);
    }

    @Patch(':id/complete')
    complete(@Param('id') id: number, @Req() req) {
        const user = req.user;
        return this.saleService.completeSale(id, user);
    }

    @Patch(':id/cancel')
    cancel(@Param('id') id: number, @Req() req) {
        const user = req.user;
        return this.saleService.cancelSale(id, user);
    }
}