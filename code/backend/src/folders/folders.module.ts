import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StorageScopeService } from '../common/auth/storage-scope.service';
import { Document } from '../documents/entities/document.entity';
import { User } from '../users/entities/user.entity';
import { FoldersController } from './folders.controller';
import { FoldersService } from './folders.service';

@Module({
  imports: [TypeOrmModule.forFeature([Document, User])],
  controllers: [FoldersController],
  providers: [FoldersService, StorageScopeService],
  exports: [FoldersService],
})
export class FoldersModule {}
