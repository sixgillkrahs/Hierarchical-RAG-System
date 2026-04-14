import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Role } from './role.entity';

@Entity({ name: 'role_storage_scopes' })
@Index('IDX_role_storage_scopes_role_id', ['roleId'])
@Index('IDX_role_storage_scopes_path_prefix', ['pathPrefix'])
@Index('UQ_role_storage_scopes_role_prefix_capability', ['roleId', 'pathPrefix', 'capability'], {
  unique: true,
})
export class RoleStorageScope {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => Role, (role) => role.storageScopes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ name: 'path_prefix', type: 'text', default: '' })
  pathPrefix!: string;

  @Column({ type: 'varchar', length: 20 })
  capability!: 'read' | 'manage';

  @Column({ name: 'inherit_children', default: true })
  inheritChildren!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
