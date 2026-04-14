import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DataSourceOptions } from 'typeorm';

import { Document } from '../documents/entities/document.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { CreateRbacTables1712400000000 } from './migrations/1712400000000-create-rbac-tables';
import { AddPermissionRoutes1712400000001 } from './migrations/1712400000001-add-permission-routes';
import { CreateDocumentsTable1712400000002 } from './migrations/1712400000002-create-documents-table';

type DbEnv = {
  DB_DATABASE?: unknown;
  DB_HOST?: unknown;
  DB_LOGGING?: unknown;
  DB_PASSWORD?: unknown;
  DB_PORT?: unknown;
  DB_RUN_MIGRATIONS?: unknown;
  DB_SSL?: unknown;
  DB_SYNCHRONIZE?: unknown;
  DB_TYPE?: unknown;
  DB_USERNAME?: unknown;
  NODE_ENV?: unknown;
};

function toBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }
  }

  return fallback;
}

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

function toString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export function createTypeOrmOptions(env: DbEnv): TypeOrmModuleOptions {
  const dbType = toString(env.DB_TYPE, 'postgres');
  const synchronize = toBoolean(env.DB_SYNCHRONIZE, false);
  const logging = toBoolean(env.DB_LOGGING, false);
  const entities = [User, Role, Permission, Document];

  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      database: toString(env.DB_DATABASE, ':memory:'),
      dropSchema: toString(env.NODE_ENV, 'development') === 'test',
      entities,
      logging,
      synchronize,
    };
  }

  return {
    type: 'postgres',
    host: toString(env.DB_HOST, 'localhost'),
    port: toNumber(env.DB_PORT, 5432),
    username: toString(env.DB_USERNAME, 'postgres'),
    password: toString(env.DB_PASSWORD, 'postgres'),
    database: toString(env.DB_DATABASE, 'hierarchical_rag'),
    ssl: toBoolean(env.DB_SSL, false) ? { rejectUnauthorized: false } : false,
    entities,
    logging,
    migrations: [
      CreateRbacTables1712400000000,
      AddPermissionRoutes1712400000001,
      CreateDocumentsTable1712400000002,
    ],
    migrationsRun: toBoolean(env.DB_RUN_MIGRATIONS, true),
    synchronize,
  };
}

export function createDataSourceOptions(env: DbEnv): DataSourceOptions {
  return createTypeOrmOptions(env) as DataSourceOptions;
}
