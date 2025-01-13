import { S3Client } from '@aws-sdk/client-s3';

export const S3_CLIENT = 'S3_CLIENT';

export const s3ClientProvider = {
  provide: S3_CLIENT,
  useFactory: () => {
    return new S3Client({
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_SECRET_KEY!,
      },
    });
  },
};
