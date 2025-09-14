import { BadRequestException, Injectable } from '@nestjs/common';
import Upload from 'graphql-upload/Upload.mjs';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JobService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly minioService: MinioService,
	) {}

	async getAll() {
		const jobs = await this.prismaService.job.findMany({ orderBy: {updatedAt: 'desc'} });
		return jobs;
	}

	async createJob(file: Upload) {
        let upload;
		try {
            upload = await file;
		} catch (error) {
			console.error('File resolution error:', error);
			throw new BadRequestException(`Ошибка обработки файла: ${error.message}`);
		}

		const { createReadStream, filename, mimetype } = upload;

		const stream = createReadStream();
		const chunks: Buffer[] = [];
		for await (const chunk of stream) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);

		const uniqueFilename = `${Date.now()}-${filename}`;

		const url = await this.minioService.uploadFile(uniqueFilename, buffer, mimetype);

		await this.prismaService.job.create({
			data: {
				filename: uniqueFilename,
				presignedUrl: url
			}
		})

		return url;
	}
}
