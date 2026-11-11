import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

export class DashboardFilterDto {
  @ApiPropertyOptional({
    description: 'Janela de dias para projetos urgentes (default: 7)',
    default: 7,
    minimum: 0,
    maximum: 365,
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(365)
  urgentDays?: number;

  @ApiPropertyOptional({
    description: 'Filtro rápido de período em dias (ex.: 7, 15, 21, 30)',
    example: 30,
    minimum: 1,
    maximum: 3650,
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3650)
  periodDays?: number;

  @ApiPropertyOptional({
    description: 'Data inicial do filtro (YYYY-MM-DD)',
    example: '2026-10-12',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final do filtro (YYYY-MM-DD)',
    example: '2026-11-11',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filtrar métricas pelo status do projeto',
    enum: ProjectStatus,
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Filtrar métricas por cliente específico (UUID)',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsUUID()
  clientId?: string;
}

