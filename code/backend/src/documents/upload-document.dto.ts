import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Document file to upload.',
  })
  file!: unknown;

  @ApiPropertyOptional({
    example: 'reports/2026',
    description: 'Optional folder path prefix inside MinIO and PostgreSQL metadata.',
  })
  @IsOptional()
  @IsString()
  folder_path?: string;
}
