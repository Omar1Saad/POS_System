import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { CreateSalesItemsDto } from "./dto/create-salesItems.dto";
import { UpdateSalesItemsDto } from "./dto/update-salesItems.dto";
import { SaleItemsService } from "./saleItems.services";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { UserRole } from "src/users/entities/user.entity";

@UseGuards(JwtAuthGuard)
@Controller('sales-items')
export class SaleItemsController {
    constructor( private readonly saleService: SaleItemsService ) {}
    
    @Post()
    create(@Body() createSaleDto: CreateSalesItemsDto) {
        return this.saleService.createSaleItems(createSaleDto);
    }

    @Post('bulk')
    bulkCreate(@Body() createSaleDto: CreateSalesItemsDto[]) {
        return this.saleService.BulkCreateSaleItems(createSaleDto);
    }

    @Get()
    findAll(
        @Req() req,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page:number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit:number,
    ) {
        const user = req.user;
        return this.saleService.getSaleItems(user, {page, limit});
    }

    @Get(':id')
    findOne(@Param('id') id: number, @Req() req) {
        const user = req.user;
        return this.saleService.getSaleItemsById(id, user);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updateSaleDto: UpdateSalesItemsDto, @Req() req) {
        const user = req.user
        return this.saleService.updateSaleItems(id, updateSaleDto, user);
    }

    @Delete(':id')
    remove(@Param('id') id: number, @Req() req) {
        const user = req.user
        return this.saleService.delete(id, user);
    }

    @Delete('sale/:saleId')
    removeBySaleId(@Param('saleId') saleId: number, @Req() req) {
        return this.saleService.deleteBySaleId(saleId);
    }
}