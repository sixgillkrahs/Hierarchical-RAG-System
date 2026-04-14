import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Document } from '../documents/entities/document.entity';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [FoldersController],
  providers: [FoldersService],
})
export class FoldersModule {}
