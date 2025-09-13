import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JobService } from './job.service';
import { JobModel } from './model/job.model';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import Upload from 'graphql-upload/Upload.mjs';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';

@Resolver()
export class JobResolver {
	
	constructor(private readonly jobService: JobService) {}

	@Query(() => [JobModel])
	async getJobs() {
		return this.jobService.getAll();
	}

	@Mutation(() => JobModel)
	async createTranscriptionJob(
		@Args('audio', { type: () => GraphQLUpload }, FileValidationPipe)
		audio: Upload
	) {
		return this.jobService.createJob(audio)
	}

}
