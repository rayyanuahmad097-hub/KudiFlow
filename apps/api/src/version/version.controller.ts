import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

export interface VersionInfo {
  /** SDK version string */
  version: string;
  /** Build number/timestamp */
  build?: string;
  /** API version */
  apiVersion: string;
  /** Environment */
  environment: string;
  /** Timestamp of the response */
  timestamp: string;
}

@ApiTags('System')
@Controller()
export class VersionController {
  @Get('version')
  @ApiOperation({
    summary: 'Get SDK and API version information',
    description: 'Returns the current SDK version, API version, and environment details. Useful for debugging and compatibility checks.',
  })
  @ApiResponse({
    status: 200,
    description: 'Version information retrieved successfully',
    example: {
      version: '0.0.1',
      build: '2024.01.15.120000',
      apiVersion: 'v1',
      environment: 'development',
      timestamp: '2024-01-15T12:00:00.000Z',
    },
  })
  getVersion(): VersionInfo {
    return {
      version: process.env.npm_package_version || '0.0.1',
      build: process.env.BUILD_NUMBER || new Date().toISOString(),
      apiVersion: 'v1',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }
}
