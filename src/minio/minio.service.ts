import { CreateBucketCommand, PutBucketPolicyCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {

    private readonly s3Client: S3Client;
    private readonly logger = new Logger(MinioService.name)
    private readonly BUCKET_NAME: string = ""
    
    

    constructor(private configService: ConfigService) {
        this.s3Client = new S3Client({
            endpoint: this.configService.getOrThrow<string>('MINIO_ENDPOINT'),
            region: 'kz-1',
            credentials: {
                accessKeyId: this.configService.getOrThrow<string>('MINIO_ROOT_USER'),
                secretAccessKey: this.configService.getOrThrow<string>('MINIO_ROOT_PASSWORD')
            },
            forcePathStyle: true
        })

        this.BUCKET_NAME = this.configService.get<string>("MINIO_BUCKET") || 'audio'
    }

    async onModuleInit() {
        try {

            await this.s3Client.send(new CreateBucketCommand({ Bucket: this.BUCKET_NAME }))

            this.logger.log(`Бакет ${ this.BUCKET_NAME } успешно создан`)

            const policy = {
                Version: '2025-12-09',
                Statement: [{
                    Effect: 'Allow',
                    Principal: '*',
                    Action: ['s3:GetObject'],
                    Resourse: [`arn:aws:s3:::${this.BUCKET_NAME}/*`]
                }]
            }

            await this.s3Client.send(new PutBucketPolicyCommand({
                Bucket: this.BUCKET_NAME,
                Policy: JSON.stringify(policy)
            }))

            this.logger.log(`Публичная политика установлена для бакета ${this.BUCKET_NAME}`);

        } catch (error) {

            if (error.name === 'BucketAlreadyOwnedByYou') {
                this.logger.log(`Бакет ${this.BUCKET_NAME} уже существует`);
            } else {
                this.logger.error('Ошибка при создании бакета или установке политики:', error.message);
            }

        }
    }

    async uploadFile(key: string, file: Buffer) {
        const { PutObjectCommand } = await import('@aws-sdk/client-s3')
        await this.s3Client.send(new PutObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: key,
            Body: file
        }))

        return `${this.BUCKET_NAME}/${key}`
    }
}
