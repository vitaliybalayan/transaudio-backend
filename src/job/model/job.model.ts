import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Job, JobStatus } from "generated/prisma";

registerEnumType(JobStatus, {
    name: 'JobStatus'
})

@ObjectType()
export class JobModel implements Job {
    @Field(() => ID)
    public id: string

    @Field(() => JobStatus)
    public status: JobStatus

    @Field(() => String)
    public filename: string

    @Field(() => Date)
	public createdAt: Date

	@Field(() => Date)
	public updatedAt: Date
}