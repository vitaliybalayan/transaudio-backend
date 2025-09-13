import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common";
import { ReadStream } from "fs";
import { validateFileFormat, validateFileSize } from "../utils/file.util";

export class FileValidationPipe implements PipeTransform {
    public async transform(value: any, metadata: ArgumentMetadata) {
        if (!value.filename) {
            throw new BadRequestException('Файл не загружен')
        }

        const { filename, createReadStream } = value
        const fileStream = createReadStream() as ReadStream

        const allowedFormats = ['mp3', 'wav', 'pcm', 'ogg'];
        const isFileFormatValid = validateFileFormat(filename, allowedFormats)

        if (!isFileFormatValid) {
            throw new BadRequestException('Неподдерживаемый формат файла')
        }

        const isFileSizeValid = await validateFileSize(fileStream, 1024 * 1024 * 10)
        
        if (!isFileSizeValid) {
            throw new BadRequestException('Размер файла превышает 10МБ')
        }

        return value
    }
}