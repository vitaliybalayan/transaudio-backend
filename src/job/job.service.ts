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
        const jobs = await this.prismaService.job.findMany()
        return jobs
    }

	async createJob(file: Upload) {
        
        if (!file.file) throw new BadRequestException('Файл не найден по какой-то причине.')

        const { createReadStream, filename } = file.file;

        const stream = createReadStream();
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        // Генерация уникального имени файла
        const uniqueFilename = `${Date.now()}-${filename}`;

        return this.minioService.uploadFile(uniqueFilename, buffer);
	}
}
