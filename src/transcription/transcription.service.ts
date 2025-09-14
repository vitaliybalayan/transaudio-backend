import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { fakerRU as faker } from '@faker-js/faker';
import { JobModel } from 'src/job/model/job.model';
import { JobStatus } from 'generated/prisma';

@Injectable()
export class TranscriptionService {
	private readonly logger = new Logger(TranscriptionService.name);

	constructor(private readonly prismaService: PrismaService) {}

	async executeJobs() {
		const jobs = await this.prismaService.job.findMany({
			where: {
				status: 'CREATED',
			},
			take: 5,
		});

		if (jobs.length > 0) {
			const jobIds = jobs.map(j => j.id);
			this.logger.log(`Найдены записи [#${jobIds.join(', #')}]`);

			for (const job of jobs) {

                const status: JobStatus = Math.random() < 0.8 ? 'SUCCESS' : 'ERROR'

				await this.prismaService.job.update({
					where: {
						id: job.id,
					},
					data: {
						transcriptionText: status === 'SUCCESS' ? faker.lorem.text() : null,
                        status,
					},
				});
			}
		}
	}
}
