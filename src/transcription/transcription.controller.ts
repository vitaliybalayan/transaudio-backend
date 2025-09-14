import { Controller } from '@nestjs/common';
import { TranscriptionService } from './transcription.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('transcription')
export class TranscriptionController {
	constructor(private readonly transcriptionService: TranscriptionService) {}

	@Cron(CronExpression.EVERY_10_SECONDS)
	async checkJobs() {
		await this.transcriptionService.executeJobs()
	}
}
