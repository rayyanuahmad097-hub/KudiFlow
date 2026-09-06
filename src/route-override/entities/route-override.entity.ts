import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OverrideType {
  /** Force this bridge to always be ranked first for the matching route */
  FORCE_FIRST = 'force_first',
  /** Exclude this bridge from results for the matching route */
  EXCLUDE = 'exclude',
  /** Apply a custom score boost/penalty (positive = boost, negative = penalty) */
  SCORE_ADJUSTMENT = 'score_adjustment',
}

@Entity('route_overrides')
@Index(['sourceChain', 'destinationChain', 'sourceToken', 'bridgeId'], {
  unique: true,
})
export class RouteOverride {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  @Index()
  bridgeId: string;

  @Column({ length: 50 })
  sourceChain: string;

  @Column({ length: 50 })
  destinationChain: string;

  @Column({ length: 50 })
  sourceToken: string;

  @Column({ type: 'enum', enum: OverrideType })
  overrideType: OverrideType;

  /**
   * Used when overrideType = SCORE_ADJUSTMENT.
   * Range: -100 to +100. Positive values boost the route, negative values penalise it.
   */
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 0 })
  scoreAdjustment: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
