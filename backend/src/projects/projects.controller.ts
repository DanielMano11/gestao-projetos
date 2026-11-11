import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import {
  CreatePaymentDto,
  UpdateProjectFinancialsDto,
} from './dto/update-project-financials.dto';
import { ProjectFilterDto } from './dto/project-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get('projects')
  @ApiOperation({ summary: 'Lista projetos com filtros de status, cliente, atraso e urgência' })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() filter: ProjectFilterDto,
  ) {
    return this.projectsService.findAll(user.id, filter);
  }

  @Post('projects')
  @ApiOperation({ summary: 'Cria um novo projeto vinculado a um cliente' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.id, dto);
  }

  @Get('projects/:id')
  @ApiOperation({ summary: 'Detalha projeto com cliente, checklist, parcelas e métricas' })
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.findOne(user.id, id);
  }

  @Patch('projects/:id')
  @ApiOperation({ summary: 'Atualiza dados gerais do projeto' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(user.id, id, dto);
  }

  @Patch('projects/:id/status')
  @ApiOperation({ summary: 'Atualiza status do projeto (conclui tarefas automaticamente quando COMPLETED)' })
  updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectStatusDto,
  ) {
    return this.projectsService.updateStatus(user.id, id, dto);
  }

  @Patch('projects/:id/financials')
  @ApiOperation({ summary: 'Atualiza diretamente valor cobrado e valor pago acumulado' })
  updateFinancials(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectFinancialsDto,
  ) {
    return this.projectsService.updateFinancials(user.id, id, dto);
  }

  @Post('projects/:id/payments')
  @ApiOperation({ summary: 'Registra parcela/pagamento individual e soma ao valor pago do projeto' })
  addPayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.projectsService.addPayment(user.id, id, dto);
  }

  @Delete('payments/:id')
  @ApiOperation({ summary: 'Remove lançamento de parcela e estorna valor pago do projeto' })
  removePayment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.removePayment(user.id, id);
  }

  @Delete('projects/:id')
  @ApiOperation({ summary: 'Remove projeto e suas tarefas/parcelas em cascata' })
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.remove(user.id, id);
  }
}

