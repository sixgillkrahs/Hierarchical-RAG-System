import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'editor@company.com',
    description: 'Updated unique email address used for login.',
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(160)
  email?: string;

  @ApiPropertyOptional({
    example: 'Senior Content Editor',
    description: 'Updated human-readable display name.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'NewPassword123!',
    description: 'Replacement password for the user account.',
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password?: string;

  @ApiPropertyOptional({
    example: [
      '4d9a7f1b-bf37-4fba-9d62-f7a57bc27b53',
      '9d84467c-3db1-4224-9d10-dc9d820e90b0',
    ],
    description:
      'Replacement role UUID list. Send an empty array to clear all roles.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  roleIds?: string[];

  @ApiPropertyOptional({
    example: false,
    description: 'Set to false to deactivate the account, or true to reactivate it.',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
