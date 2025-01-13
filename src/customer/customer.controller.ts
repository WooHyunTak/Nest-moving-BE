import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create.customer.dto';
import { AuthGuard } from '@nestjs/passport';
import { TokenPayload } from 'src/common/dto/tokenPayload.dto';
import { User } from 'src/common/decorators/user.decorator';
import { UpdateCustomerDto } from './dto/update.customer.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CommonService } from 'src/common/common.service';

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly commonService: CommonService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('imageUrl')) // '필드명' form-data의 요청을 파싱
  async createCustomer(
    @Body() body: CreateCustomerDto,
    @User() user: TokenPayload,
    @UploadedFiles() files: Express.Multer.File[], // interceptor가 파싱한 파일 배열을 메소드로 활용하도록
  ) {
    const { id: userId } = user;
    const imageUrl = await this.commonService.uploadFiles(files);
    const customer = await this.customerService.createCustomer(userId, {
      ...body,
      imageUrl: imageUrl[0],
    });
    return customer;
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FilesInterceptor('imageUrl'))
  async updateCustomer(
    @Body() body: UpdateCustomerDto,
    @User() user: TokenPayload,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const { customerId } = user;
    const imageUrl = await this.commonService.uploadFiles(files);
    const customer = await this.customerService.updateCustomer(customerId, {
      ...body,
      imageUrl: imageUrl[0],
    });
    return customer;
  }
}
