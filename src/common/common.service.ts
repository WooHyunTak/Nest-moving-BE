import { BadRequestException, Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3_CLIENT } from './providers/s3-client.provider';
import { Inject } from '@nestjs/common';

@Injectable()
export class CommonService {
  constructor(@Inject(S3_CLIENT) private readonly s3Client: S3Client) {}

  async uploadFiles(
    files: Express.Multer.File[],
    optional: boolean = false,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      if (optional) {
        return [];
      }
      throw new BadRequestException('이미지 파일이 없습니다.');
    }

    const uploadPromises = files.map(async (file) => {
      const key = `profiles/${Date.now()}-${file.originalname}`;
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
    });

    return Promise.all(uploadPromises);
  }
}
