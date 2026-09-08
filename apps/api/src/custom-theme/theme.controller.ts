import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import {
  CreateThemeDto,
  ThemeCssVariablesResponseDto,
  ThemeOverrideDto,
  ThemePreviewResponseDto,
  ThemeQueryDto,
  ThemeResponseDto,
  UpdateThemeDto,
} from './dto/theme.dto';
import { ThemeScope } from './entities/theme.entity';
import { ThemeService } from './theme.service';

@ApiTags('Themes')
@ApiBearerAuth()
@Controller('themes')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new theme' })
  @ApiCreatedResponse({ type: ThemeResponseDto })
  async create(
    @Body() dto: CreateThemeDto,
    @Req() req: Request,
  ): Promise<ThemeResponseDto> {
    const actorId = (req as any).user?.id;
    return this.themeService.create(dto, actorId);
  }

  @Get()
  @ApiOperation({ summary: 'List themes with optional scope filter' })
  @ApiOkResponse({ type: [ThemeResponseDto] })
  @ApiQuery({ name: 'scope', enum: ThemeScope, required: false })
  @ApiQuery({ name: 'scopeOwnerId', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'isDefault', required: false, type: Boolean })
  async findAll(@Query() query: ThemeQueryDto): Promise<ThemeResponseDto[]> {
    return this.themeService.findAll(query);
  }

  @Get('default')
  @ApiOperation({ summary: 'Get the default theme for a scope' })
  @ApiOkResponse({ type: ThemeResponseDto })
  @ApiQuery({ name: 'scope', enum: ThemeScope, required: false })
  @ApiQuery({ name: 'scopeOwnerId', required: false })
  async getDefault(
    @Query('scope') scope?: ThemeScope,
    @Query('scopeOwnerId') scopeOwnerId?: string,
  ): Promise<ThemeResponseDto> {
    return this.themeService.getDefaultTheme(scope ?? ThemeScope.GLOBAL, scopeOwnerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a theme by ID' })
  @ApiOkResponse({ type: ThemeResponseDto })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ThemeResponseDto> {
    return this.themeService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a theme' })
  @ApiOkResponse({ type: ThemeResponseDto })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateThemeDto,
    @Req() req: Request,
  ): Promise<ThemeResponseDto> {
    const actorId = (req as any).user?.id;
    return this.themeService.update(id, dto, actorId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a theme' })
  @ApiNoContentResponse()
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<void> {
    const actorId = (req as any).user?.id;
    return this.themeService.remove(id, actorId);
  }

  // ─── Overrides ────────────────────────────────────────────────────────────

  @Post(':id/override')
  @ApiOperation({ summary: 'Apply partial config overrides to a theme' })
  @ApiOkResponse({ type: ThemeResponseDto })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: ThemeOverrideDto })
  async applyOverride(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ThemeOverrideDto,
    @Req() req: Request,
  ): Promise<ThemeResponseDto> {
    const actorId = (req as any).user?.id;
    return this.themeService.applyOverride(id, dto, actorId);
  }

  @Post(':id/reset')
  @ApiOperation({ summary: 'Reset theme to its default/parent config' })
  @ApiOkResponse({ type: ThemeResponseDto })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async resetToDefault(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ): Promise<ThemeResponseDto> {
    const actorId = (req as any).user?.id;
    return this.themeService.resetToDefault(id, actorId);
  }

  // ─── Clone ────────────────────────────────────────────────────────────────

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a theme under a new name' })
  @ApiCreatedResponse({ type: ThemeResponseDto })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ schema: { properties: { name: { type: 'string' } }, required: ['name'] } })
  async clone(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('name') name: string,
    @Req() req: Request,
  ): Promise<ThemeResponseDto> {
    const actorId = (req as any).user?.id;
    return this.themeService.clone(id, name, actorId);
  }

  // ─── CSS ──────────────────────────────────────────────────────────────────

  @Get(':id/css')
  @ApiOperation({ summary: 'Get CSS custom property variables for a theme' })
  @ApiOkResponse({ type: ThemeCssVariablesResponseDto })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getCssVariables(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ThemeCssVariablesResponseDto> {
    return this.themeService.getCssVariables(id);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Preview a theme — returns theme data + CSS variables bundle' })
  @ApiOkResponse({ type: ThemePreviewResponseDto })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  async getPreview(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ThemePreviewResponseDto> {
    return this.themeService.getPreview(id);
  }
}
