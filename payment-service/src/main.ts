import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { AllExceptionsFilter } from './exceptions/AllExceptions';
import { ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.use('/health', (_req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'ok' });
  });

  const config = app.get(ConfigService);

  const port = config.getOrThrow<number>('PORT');
  const tcpPort = config.getOrThrow<number>('TCPPORT');
  const tcpHost = config.getOrThrow<string>('TCPHOST');

  /* ---------------- TCP (Order → Payment) ---------------- */
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: tcpHost,
      port: tcpPort,
    },
  });

  /* ---------------- RabbitMQ (Worker) ---------------- */
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [
        config.getOrThrow<string>('RABBITMQ_URL'),
      ],
      queue: config.getOrThrow<string>('RABBITMQ_QUEUE'),
      queueOptions: {
        durable: true,
      },
    },
  });

  await app.startAllMicroservices();
  console.log(`[TCP] PAYMENT Service running on ${tcpPort}`);
  console.log('[RMQ] Transaction worker connected');

  await app.listen(port);
  console.log('[PAYMENT SERVICE RUNNING]', `http://localhost:${port}`);
}
bootstrap();
