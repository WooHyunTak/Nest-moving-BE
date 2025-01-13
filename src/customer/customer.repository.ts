import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create.customer.dto';
import { UpdateCustomerDto } from './dto/update.customer.dto';
import { PrismaService } from 'src/prisma.service';

interface CustomerProfile extends CreateCustomerDto {
  userId: number;
}

@Injectable()
export class CustomerRepository {
  constructor(private readonly prismaClient: PrismaService) {}

  create(profile: CustomerProfile) {
    return this.prismaClient.customer.create({
      data: {
        ...profile,
        imageUrl: {
          create: {
            imageUrl: profile.imageUrl,
          },
        },
      },
    });
  }

  update(customerId: number, profile: UpdateCustomerDto) {
    return this.prismaClient.customer.update({
      where: { id: customerId },
      data: {
        ...profile,
        imageUrl: {
          create: {
            imageUrl: profile.imageUrl,
          },
        },
      },
    });
  }
}
