import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins: string[] = [
    'http://localhost:3001',
    'https://moving-fe-e1p7.vercel.app',
    'https://moving-fe-weld.vercel.app',
  ];
  // CORS 설정
  const corsOptions: CorsOptions = {
    credentials: true,
    origin: function (
      origin: string | undefined,
      callback: (err: Error | null, origin?: string) => void,
    ) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // 허용
      } else {
        callback(new Error('Not allowed by CORS')); // 허용하지 않음
      }
    },
    exposedHeaders: ['set-cookie'],
  };

  app.enableCors(corsOptions);
  app.use(cookieParser());
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.PORT ?? 3000, () =>
    console.log(
      `SERVER START ${process.env.PORT ?? 3000} RUNNING ${process.env.RUN_CONDITION}`,
    ),
  );
}
bootstrap();
