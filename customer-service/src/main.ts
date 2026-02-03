import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';
import { AllExceptionsFilter } from './exceptions/AllExceptions';
import { CustomerService } from './modules/customers/customer.service';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  app.enableCors();

  const config: ConfigService = app.get(ConfigService);
  const port: number = config.getOrThrow<number>('PORT');
  const tcpPort: number = config.getOrThrow<number>('TCPPORT');
  const tcpHost = config.getOrThrow<string>('TCPHOST');

  // health check route
  app.use('/health', (_req: express.Request, res: express.Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  const customerService = app.get(CustomerService);
  await customerService.seedCustomer();


  await app.listen(port, () => {
    console.log('[CUSTOMER SERVICE RUNNING]', `http://localhost:${port}`);
  });

  // Start TCP microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: tcpHost,
      port: tcpPort,
    },
  });

  await app.startAllMicroservices();
  console.log(`[TCP] Order Service Microservice running on port ${tcpPort}`);
}
bootstrap();
