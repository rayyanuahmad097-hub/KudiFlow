import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseFilters,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiServiceUnavailableResponse,
} from '@nestjs/swagger';
import { BridgeCompareService } from './bridge-compare.service';
import { BridgeStatusService, BridgeStatusInfo } from './bridge-status.service';
import { GetQuotesDto } from './dto';
import { QuoteResponse, NormalizedQuote } from './interfaces';

@ApiTags('bridge-compare')
@Controller('bridge-compare')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class BridgeCompareController {
  constructor(
    private readonly bridgeCompareService: BridgeCompareService,
    private readonly bridgeStatusService: BridgeStatusService,
  ) {}

  @Get('quotes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fetch ranked bridge quotes',
    description:
      'Returns normalized, ranked quotes from all supported bridge providers for the requested route.',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranked quotes returned successfully',
  })
  @ApiBadRequestResponse({ description: 'Invalid request parameters' })
  @ApiNotFoundResponse({ description: 'No routes found for the token pair' })
  @ApiServiceUnavailableResponse({
    description: 'All bridge providers unavailable',
  })
  async getQuotes(@Query() dto: GetQuotesDto): Promise<QuoteResponse> {
    return this.bridgeCompareService.getQuotes(dto);
  }

  @Get('quotes/:bridgeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get specific bridge route details',
    description:
      'Returns the full normalized quote for a specific bridge provider.',
  })
  @ApiParam({
    name: 'bridgeId',
    description: 'Bridge provider identifier',
    example: 'stargate',
  })
  @ApiResponse({ status: 200, description: 'Route details returned' })
  @ApiNotFoundResponse({ description: 'Route not found' })
  async getRouteDetails(
    @Param('bridgeId') bridgeId: string,
    @Query() dto: GetQuotesDto,
  ): Promise<NormalizedQuote> {
    return this.bridgeCompareService.getRouteDetails(dto, bridgeId);
  }

  @Get('providers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all supported bridge providers',
    description:
      'Returns all configured bridge providers with their supported chains and tokens.',
  })
  @ApiResponse({ status: 200, description: 'Providers listed successfully' })
  getSupportedBridges() {
    return this.bridgeCompareService.getSupportedBridges();
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all bridge statuses',
    description: 'Returns the current status and uptime metrics for all bridge providers.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bridge statuses returned successfully',
  })
  getAllBridgesStatus(): BridgeStatusInfo[] {
    return this.bridgeStatusService.getAllBridgesStatus();
  }

  @Get('status/:bridgeId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get specific bridge status',
    description: 'Returns the current status, uptime, and health metrics for a specific bridge.',
  })
  @ApiParam({
    name: 'bridgeId',
    description: 'Bridge provider identifier',
    example: 'stargate',
  })
  @ApiResponse({ status: 200, description: 'Bridge status returned' })
  @ApiNotFoundResponse({ description: 'Bridge not found' })
  getBridgeStatus(@Param('bridgeId') bridgeId: string): BridgeStatusInfo | undefined {
    return this.bridgeStatusService.getBridgeStatus(bridgeId);
  }
}

