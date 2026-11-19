import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  configureApp(app);

  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('NODE_ENV');

  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Sistema de Gestão de Projetos API')
      .setDescription(
        'API RESTful para gerenciamento de clientes, projetos, prazos, checklists e fluxo de caixa',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.getOrThrow<number>('PORT');
  await app.listen(port);
}

void bootstrap();
