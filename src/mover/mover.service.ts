import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMoverDto } from './dto/create.mover.dto';
import { UpdateMoverDto } from './dto/update.mover.dto';
import { MoverRepository } from './mover.repository';
import { throwHttpError } from 'src/common/utills/constructors/httpError';
import { WhereConditions } from './dto/whereConditions';
import { QueryString } from './dto/queryString.dto';
import processMoversData from 'src/common/utills/movers/processMoverData';
import { MovingRequestRepository } from 'src/moving-request/moving-request.repository';
import getRatingsByMoverIds from 'src/common/utills/movers/getRatingsByMover';

@Injectable()
export class MoverService {
  constructor(
    private readonly moverRepository: MoverRepository,
    private readonly movingRequestRepository: MovingRequestRepository,
  ) {}

  setOrderByOptions = (order: string): { [key: string]: object | string } => {
    switch (order) {
      case 'review':
        return { review: { _count: 'desc' } };
      case 'career':
        return { career: 'desc' };
      case 'confirm':
        return { confirmedQuote: { _count: 'desc' } };
      default:
        return { review: { _count: 'desc' } };
    }
  };

  //기사 목록 조회
  getMoverList = async (query: QueryString, customerId: number | null) => {
    const { orderBy, keyword, region, service, cursor, limit, isFavorite } =
      query;

    //정렬 옵션 설정
    const orderByOptions = this.setOrderByOptions(orderBy);

    //쿼리 조건 설정
    const whereConditions: WhereConditions = {};
    if (keyword) {
      whereConditions.OR = [
        { nickname: { contains: keyword, mode: 'insensitive' } },
        { introduction: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (region) {
      whereConditions.regions = { has: region };
    }
    if (service) {
      whereConditions.services = { has: service };
    }
    if (isFavorite && customerId) {
      whereConditions.favorite = { some: { id: customerId } };
    }

    //데이터 조회
    const movers = await this.moverRepository.getMoverList(
      orderByOptions,
      whereConditions,
      cursor,
      limit,
    );

    if (!movers) {
      throw new NotFoundException('조건에 맞는 기사 목록이 없습니다.');
    }

    //평균 평점 조회
    const moverIds = movers.map((mover) => mover.id);
    const ratingsByMover = await getRatingsByMoverIds(
      moverIds,
      this.moverRepository,
    );

    //커서 설정
    const nextMover = movers.length > limit;
    const nextCursor = nextMover ? movers[limit - 1].id : '';
    const hasNext = Boolean(nextCursor);

    //데이터 가공
    const resMovers = await processMoversData(
      customerId,
      movers,
      ratingsByMover,
      this.movingRequestRepository,
    );

    //평균 평점으로 정렬
    if (orderBy === 'rating') {
      resMovers.sort(
        (a, b) => (b.rating?.average || 0) - (a.rating?.average || 0),
      );
    }

    //응답 데이터 반환
    return {
      nextCursor,
      hasNext,
      list: resMovers.slice(0, limit),
    };
  };

  //찜한 기사 목록 조회
  getMoverByFavorite = async (
    customerId: number,
    limit: number,
    cursor: number,
  ) => {
    const movers = await this.moverRepository.getMoverByFavorite(
      customerId,
      limit,
      cursor,
    );

    if (!movers.length) {
      throw new NotFoundException('찜한 기사가 없습니다.');
    }

    const moverIds = movers.map((mover) => mover.id);
    const ratingsByMover = await getRatingsByMoverIds(
      moverIds,
      this.moverRepository,
    );
    const processMovers = await processMoversData(
      customerId,
      movers,
      ratingsByMover,
      this.movingRequestRepository,
    );

    //커서 설정
    const nextMover = movers.length > limit;
    const nextCursor = nextMover ? movers[limit - 1].id : '';
    const hasNext = Boolean(nextCursor);

    return {
      nextCursor,
      hasNext,
      list: processMovers.slice(0, limit),
    };
  };

  //기사 상세 조회
  getMoverDetail = async (customerId: number | null, moverId: number) => {
    const mover = await this.moverRepository.getMoverById(customerId, moverId);
    if (!mover) {
      throw new NotFoundException('기사 정보를 찾을 수 없습니다.');
    }

    //데이터 가공
    const ratingsByMover = await getRatingsByMoverIds(
      moverId,
      this.moverRepository,
    );
    const processMover = await processMoversData(
      customerId,
      mover,
      ratingsByMover,
      this.movingRequestRepository,
    );

    return processMover[0];
  };

  //찜 토글
  moverFavorite = async (customerId: number, moverId: number) => {
    const mover = await this.moverRepository.moverFavorite(customerId, moverId);
    if (!mover) {
      throw new NotFoundException('기사 정보를 찾을 수 없습니다.');
    }

    return { ...mover, isFavorite: true };
  };

  //찜 취소
  moverFavoriteCancel = async (customerId: number, moverId: number) => {
    const mover = await this.moverRepository.moverFavoriteCancel(
      customerId,
      moverId,
    );
    if (!mover) {
      throw new NotFoundException('기사 정보를 찾을 수 없습니다.');
    }
    return { ...mover, isFavorite: false };
  };

  //기사 조회
  getMover = async (moverId: number) => {
    const mover = await this.moverRepository.getMoverById(null, moverId);

    if (!mover) {
      throw new NotFoundException('존재하지 않는 기사입니다.');
    }

    const ratingsByMover = await getRatingsByMoverIds(
      moverId,
      this.moverRepository,
    );
    const processedMover = await processMoversData(
      null,
      mover,
      ratingsByMover,
      this.movingRequestRepository,
    );

    return processedMover[0];
  };

  //기사 프로필 업데이트
  updateMoverProfile = async (
    userId: number,
    moverId: number,
    profile: UpdateMoverDto,
  ) => {
    const { imageUrl, ...rest } = profile;
    try {
      return await this.moverRepository.updateMoverProfile(
        imageUrl ? imageUrl[0] : undefined,
        userId,
        moverId,
        rest,
      );
    } catch (e) {
      throw new InternalServerErrorException('프로필 업데이트 실패');
    }
  };

  //기사 프로필 생성
  createMoverProfile = async (profile: CreateMoverDto) => {
    const moverProfile = {
      ...profile,
      imageUrl: profile.imageUrl[0],
    };
    return this.moverRepository.createMoverProfile(moverProfile);
  };
}
