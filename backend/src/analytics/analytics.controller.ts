import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  async getProfitSummary() {
    return this.analyticsService.getProfitSummary();
  }

  @Get('profit-over-time')
  async getProfitOverTime(@Query('period') period: string = '30d') {
    // Validate period format
    if (!/^\d+d$/.test(period)) {
      throw new Error('Period must be in format like "7d", "30d", "90d"');
    }
    
    return this.analyticsService.getProfitOverTime(period);
  }

  @Get('top-products')
  async getTopProfitableProducts(@Query('limit') limit: string = '5') {
    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum <= 0) {
      throw new Error('Limit must be a positive number');
    }
    
    return this.analyticsService.getTopProfitableProducts(limitNum);
  }
}
