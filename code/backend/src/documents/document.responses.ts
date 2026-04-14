import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentItemResponseDto {
  @ApiProperty({ example: 'c5f0b0c2-dc8d-4db2-9151-80479c1552f7' })
  id!: string;

  @ApiProperty({ example: 'Quarterly Report.pdf' })
  name!: string;

  @ApiProperty({ example: 'reports/2026/550e8400-report.pdf' })
  path!: string;

  @ApiProperty({ example: 'reports/2026' })
  folder_path!: string;

  @ApiProperty({ example: 'Quarterly Report.pdf' })
  original_filename!: string;

  @ApiProperty({ example: 'reports/2026/550e8400-report.pdf' })
  object_name!: string;

  @ApiProperty({ example: 'uploads' })
  bucket!: string;

  @ApiProperty({ example: 'application/pdf' })
  content_type!: string;

  @ApiProperty({ example: 1048576 })
  size!: number;

  @ApiProperty({ example: 'uploaded' })
  status!: string;

  @ApiProperty({ example: 'http://127.0.0.1:9000/uploads/reports/2026/550e8400-report.pdf' })
  url!: string;

  @ApiPropertyOptional({ example: '4f33b420-6749-4ea1-8a80-5a59f4fb6f1d' })
  uploaded_by_user_id?: string;

  @ApiProperty({ example: '2026-04-14T02:16:08.000Z' })
  created_at!: string;

  @ApiProperty({ example: '2026-04-14T02:16:08.000Z' })
  updated_at!: string;
}

export class DocumentListResponseDto {
  @ApiProperty({ example: 'reports/2026' })
  current_path!: string;

  @ApiProperty({ example: 2 })
  total!: number;

  @ApiProperty({ type: [DocumentItemResponseDto] })
  documents!: DocumentItemResponseDto[];
}
