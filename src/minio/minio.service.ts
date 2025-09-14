import { CreateBucketCommand, GetObjectCommand, PutBucketPolicyCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {

    private readonly s3Client: S3Client;
    private readonly logger = new Logger(MinioService.name)
    private readonly BUCKET_NAME: string = ""
    private readonly PRESIGNED_EXPIRES: number = 0

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
        this.PRESIGNED_EXPIRES = parseInt(this.configService.get<string>("PRESIGNED_EXPIRES") || "0") || 3600
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

    async uploadFile(key: string, file: Buffer, mimetype: string) {
        const command: PutObjectCommandInput = {
            Bucket: this.BUCKET_NAME,
            Key: String(key),
            Body: file,
            ContentType: mimetype
        }

        try {
            await this.s3Client.send(new PutObjectCommand(command))
        } catch (error) {
            throw error
        }

        return this.getPresignedUrl(key)
    }

    async getPresignedUrl(key: string): Promise<string> {
        return getSignedUrl(this.s3Client, new GetObjectCommand({
            Bucket: this.BUCKET_NAME,
            Key: key,
        }), { expiresIn: this.PRESIGNED_EXPIRES })
    }
}
