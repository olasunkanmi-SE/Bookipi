import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/http-exception.filter';
import { Logger } from '@nestjs/common';
import { validatePipeInstance } from './infrastructure/guards/validation.pipe.instance';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    app.enableCors();
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(validatePipeInstance);
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
