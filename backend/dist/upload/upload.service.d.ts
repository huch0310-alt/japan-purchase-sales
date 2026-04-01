import { ConfigService } from '@nestjs/config';
interface UploadFile {
    originalname: string;
    path: string;
}
export declare class UploadService {
    private configService;
    private readonly logger;
    private cos;
    private bucket;
    private region;
    constructor(configService: ConfigService);
    private initCos;
    getUploadDir(): string;
    ensureUploadDir(): Promise<void>;
    getFileUrl(filePath: string): string;
    deleteFile(filePath: string): Promise<void>;
    uploadToCos(file: UploadFile): Promise<string>;
    deleteFromCos(fileUrl: string): Promise<void>;
    isCosConfigured(): boolean;
}
export {};
