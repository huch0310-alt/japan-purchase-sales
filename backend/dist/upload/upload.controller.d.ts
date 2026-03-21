import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    uploadFile(file: Express.Multer.File): Promise<{
        originalName: string;
        filename: string;
        path: string;
        url: string;
        size: number;
        mimetype: string;
    }>;
}
