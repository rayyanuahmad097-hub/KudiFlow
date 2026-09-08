import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ThemeConfig } from '../types/theme-config.types';

export enum ThemeScope {
  GLOBAL = 'global',
  ORGANIZATION = 'organization',
  USER = 'user',
}

@Entity('themes')
@Index(['scope', 'isDefault'])
@Index(['name', 'scope'], { unique: true })
export class Theme {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ThemeScope,
    default: ThemeScope.GLOBAL,
  })
  scope: ThemeScope;

  @Column({ nullable: true })
  scopeOwnerId: string | null;

  @Column({ type: 'jsonb' })
  config: ThemeConfig;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isReadOnly: boolean;

  @Column({ nullable: true })
  parentThemeId: string | null;

  @Column({ nullable: true })
  createdBy: string | null;

  @Column({ nullable: true })
  updatedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date | null;
}
