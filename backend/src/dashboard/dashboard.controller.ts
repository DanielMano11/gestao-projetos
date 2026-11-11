import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Retorna resumo consolidado financeiro, contagens por status e projetos urgentes' })
  @ApiQuery({ name: 'urgentDays', required: false, type: Number })
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query('urgentDays') urgentDays?: string,
  ) {
    const days = urgentDays ? Number(urgentDays) : 7;
    return this.dashboardService.getSummary(
      user.id,
      Number.isFinite(days) && days >= 0 ? days : 7,
    );
  }
}

