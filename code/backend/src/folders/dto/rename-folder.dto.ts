import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RenameFolderDto {
  @ApiProperty({
    example: 'documents/contracts/2026',
    description: 'Current folder-like path.',
  })
  @IsString()
  @IsNotEmpty()
  current_path!: string;

  @ApiProperty({
    example: 'documents/contracts/2027',
    description: 'New folder-like path.',
  })
  @IsString()
  @IsNotEmpty()
  new_path!: string;
}
