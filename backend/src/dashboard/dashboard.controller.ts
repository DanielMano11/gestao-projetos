import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({
    summary:
      'Retorna resumo consolidado financeiro, entradas por período (7, 15, 21, 30 dias ou datas), contagens por status e projetos urgentes',
  })
  getSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filter: DashboardFilterDto,
  ) {
    return this.dashboardService.getSummary(user.id, filter);
  }
}
