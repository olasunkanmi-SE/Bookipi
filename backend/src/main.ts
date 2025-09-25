import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(process.env.PORT ?? 3000);
  } catch (error) {
    Logger.error('Failed to start the application:', error);
    process.exit(1);
  }
}
bootstrap().catch((error) => {
  Logger.error('Unhandled exception during bootstrap:', error);
  process.exit(1);
});
