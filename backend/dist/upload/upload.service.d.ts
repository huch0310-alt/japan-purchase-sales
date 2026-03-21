import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private configService;
    private cos;
    private bucket;
    private region;
    constructor(configService: ConfigService);
    private initCos;
    getUploadDir(): string;
    ensureUploadDir(): Promise<void>;
    getFileUrl(filePath: string): string;
    deleteFile(filePath: string): Promise<void>;
    uploadToCos(file: any): Promise<string>;
    deleteFromCos(fileUrl: string): Promise<void>;
    isCosConfigured(): boolean;
}
