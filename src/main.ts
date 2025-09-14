import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
// import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const config = app.get(ConfigService);

	app.use(
		// config.getOrThrow<string>('GRAPHQL_PREFIX'),
		graphqlUploadExpress({ maxFileSize: 50000000, maxFiles: 10 }),
	);

	// app.useGlobalPipes(
	// 	new ValidationPipe({
	// 		transform: true,
	// 	}),
	// );

	app.enableCors({
		origin: config.getOrThrow<string>('ALLOWED_ORIGIN'),
		credentials: true,
		exposedHeaders: ['set-cookie'],
	});

	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
