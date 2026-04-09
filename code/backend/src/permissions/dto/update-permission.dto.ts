import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    example: 'permissions.manage',
    description: 'Updated machine-readable permission code.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @ApiPropertyOptional({
    example: 'Create, update, and delete permissions.',
    description:
      'Updated human-readable permission description. Preferred over the deprecated name field.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    example: 'Create, update, and delete permissions.',
    deprecated: true,
    description: 'Deprecated alias for description kept for backward compatibility.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
