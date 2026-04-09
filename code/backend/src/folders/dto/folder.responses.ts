import { ApiProperty } from '@nestjs/swagger';

export class FolderItemResponseDto {
  @ApiProperty({ example: '2026' })
  name!: string;

  @ApiProperty({ example: 'documents/contracts/2026' })
  path!: string;

  @ApiProperty({ example: 'documents/contracts/2026/' })
  prefix!: string;
}

export class FolderListResponseDto {
  @ApiProperty({ example: 'documents/contracts' })
  current_path!: string;

  @ApiProperty({ example: 'uploads' })
  bucket!: string;

  @ApiProperty({ type: [FolderItemResponseDto] })
  folders!: FolderItemResponseDto[];
}

export class FolderCreateResponseDto {
  @ApiProperty({ example: 'documents/contracts/2026' })
  folder_path!: string;

  @ApiProperty({ example: 'documents/contracts/2026/' })
  prefix!: string;

  @ApiProperty({ example: 'uploads' })
  bucket!: string;

  @ApiProperty({ example: 'http://127.0.0.1:9000/uploads/documents/contracts/2026/' })
  url!: string;
}

export class FolderDeleteResponseDto {
  @ApiProperty({ example: 'documents/contracts/2026' })
  folder_path!: string;

  @ApiProperty({ example: 'documents/contracts/2026/' })
  prefix!: string;

  @ApiProperty({ example: 'uploads' })
  bucket!: string;

  @ApiProperty({ example: 5 })
  deleted_objects!: number;
}

export class FolderRenameResponseDto {
  @ApiProperty({ example: 'documents/contracts/2026' })
  old_path!: string;

  @ApiProperty({ example: 'documents/contracts/2026/' })
  old_prefix!: string;

  @ApiProperty({ example: 'documents/contracts/2027' })
  new_path!: string;

  @ApiProperty({ example: 'documents/contracts/2027/' })
  new_prefix!: string;

  @ApiProperty({ example: 'uploads' })
  bucket!: string;

  @ApiProperty({ example: 12 })
  moved_objects!: number;
}
