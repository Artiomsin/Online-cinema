import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ActionLogService } from './services/action-log.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const actionLogService = app.get(ActionLogService);
  app.useGlobalFilters(new AllExceptionsFilter(actionLogService));

  // ✅ Swagger конфигурация
  const config = new DocumentBuilder()
    .setTitle('Online Cinema API')
    .setDescription('Документация REST API для онлайн-кинотеатра')
    .setVersion('1.0')
    .addCookieAuth('access_token') // если используешь httpOnly cookie
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // ✅ Используем PORT из окружения или 3000 по умолчанию
  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Cinema API запущен на http://localhost:${port}`);
  console.log(`📘 Swagger доступен на http://localhost:${port}/api`);
}
bootstrap();

/*{
  "login": "vbvbvbvbbv",
  "password": "12345678"
}
 */
