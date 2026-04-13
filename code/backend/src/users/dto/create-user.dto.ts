import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'editor@company.com',
    description: 'Unique email address used for login.',
  })
  @IsEmail()
  @MaxLength(160)
  email!: string;

  @ApiProperty({
    example: 'Content Editor',
    description: 'Human-readable display name.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  displayName!: string;

  @ApiProperty({
    example: 'ChangeMe123!',
    description: 'Initial password for the user account.',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({
    example: [
      '4d9a7f1b-bf37-4fba-9d62-f7a57bc27b53',
      '9d84467c-3db1-4224-9d10-dc9d820e90b0',
    ],
    description: 'Role UUIDs assigned to the user.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the account can authenticate immediately after creation.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
