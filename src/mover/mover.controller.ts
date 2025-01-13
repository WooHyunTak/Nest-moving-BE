import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { MoverService } from './mover.service';
import { CreateMoverDto } from './dto/create.mover.dto';
import { UpdateMoverDto } from './dto/update.mover.dto';
import { QueryString } from './dto/queryString.dto';
import { User } from 'src/common/decorators/user.decorator';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtOptionalGuard } from 'src/common/guards/jwt.optional.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommonService } from 'src/common/common.service';

@Controller('movers')
export class MoverController {
  constructor(
    private readonly moverService: MoverService,
    private readonly commonService: CommonService,
  ) {}

  @Get()
  @UseGuards(JwtOptionalGuard)
  async getMoverList(@Query() query: QueryString, @User() user: TokenPayload) {
    let customerId: number | null = null;
    if (user?.customerId) {
      customerId = user.customerId;
    }
    const {
      limit = 10,
      orderBy = 'review',
      keyword = '',
      region = 0,
      service = 0,
      cursor = 0,
      isFavorite = false,
    } = query;

    const movers = await this.moverService.getMoverList(
      {
        limit,
        orderBy,
        keyword,
        region,
        service,
        cursor,
        isFavorite,
      },
      customerId,
    );
    return movers;
  }

  @Get('my-profile')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(@User() user: TokenPayload) {
    const { moverId } = user;
    const movers = await this.moverService.getMover(moverId);
    return movers;
  }

  @Get('favorite-list')
  @UseGuards(AuthGuard('jwt'))
  async getFavoriteList(
    @Query() query: QueryString,
    @User() user: TokenPayload,
  ) {
    const { customerId } = user;
    const { limit = 10, cursor = 0 } = query;
    const movers = await this.moverService.getMoverByFavorite(
      customerId,
      limit,
      cursor,
    );
    return movers;
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getMoverById(@Param('id') moverId: number, @User() user: TokenPayload) {
    let customerId: number | null = null;
    if (user.customerId) {
      customerId = user.customerId;
    }
    const movers = await this.moverService.getMoverDetail(customerId, moverId);
    return movers;
  }

  @Post(':id/favorite')
  @UseGuards(AuthGuard('jwt'))
  async addFavorite(@Param('id') moverId: number, @User() user: TokenPayload) {
    const { customerId } = user;
    const movers = await this.moverService.moverFavorite(customerId, moverId);
    return movers;
  }

  @Delete(':id/favorite')
  @UseGuards(AuthGuard('jwt'))
  async removeFavorite(
    @Param('id') moverId: number,
    @User() user: TokenPayload,
  ) {
    const { customerId } = user;
    const movers = await this.moverService.moverFavoriteCancel(
      customerId,
      moverId,
    );
    return movers;
  }

  @Patch()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('imageUrl'))
  async updateMover(
    @Body() body: UpdateMoverDto,
    @User() user: TokenPayload,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { moverId, id: userId } = user;
    const imageUrl = await this.commonService.uploadFiles(files);
    const movers = await this.moverService.updateMoverProfile(userId, moverId, {
      ...body,
      imageUrl: imageUrl,
    });
    return movers;
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('imageUrl'))
  async createMover(
    @Body() body: CreateMoverDto,
    @User() user: TokenPayload,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { id: userId } = user;
    const imageUrl = await this.commonService.uploadFiles(files);
    const movers = await this.moverService.createMoverProfile({
      ...body,
      userId,
      imageUrl: imageUrl,
    });
    return movers;
  }
}
