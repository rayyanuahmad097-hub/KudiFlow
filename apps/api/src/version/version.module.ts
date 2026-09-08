import { Module } from '@nestjs/common';
import { VersionController } from './version.controller';

/**
 * Version Module
 * 
 * Provides SDK and API version information endpoints.
 */
@Module({
  controllers: [VersionController],
})
export class VersionModule {}
