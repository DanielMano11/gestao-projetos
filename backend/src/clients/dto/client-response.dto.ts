import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  whatsapp?: string | null;

  @ApiPropertyOptional({ description: 'Somente dígitos para uso em https://wa.me/' })
  whatsappClean?: string | null;

  @ApiPropertyOptional()
  email?: string | null;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  projectsCount: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

