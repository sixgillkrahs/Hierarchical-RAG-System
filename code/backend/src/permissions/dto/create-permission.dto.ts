import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'permissions.manage',
    description: 'Unique machine-readable permission code.',
  })
  @IsNotEmpty()
  @IsString()
  code!: string;

  @ApiProperty({
    example: '/permissions',
    description: 'Frontend route unlocked by this permission.',
  })
  @IsNotEmpty()
  @IsString()
  route!: string;

  @ApiPropertyOptional({
    example: 'Create and update permissions.',
    description:
      'Human-readable permission description. Preferred over the deprecated name field.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiPropertyOptional({
    example: 'Create and update permissions.',
    deprecated: true,
    description: 'Deprecated alias for description kept for backward compatibility.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}
