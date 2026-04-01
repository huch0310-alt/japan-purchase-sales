import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, FileTypeValidator, MaxFileSizeValidator } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UploadService } from './upload.service';

/**
 * 文件上传控制器
 */
@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 上传单文件
   * 文件限制：图片(JPEG/PNG/GIF/WebP)、PDF，最大 5MB
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('super_admin', 'admin', 'procurement', 'sales')
  @ApiBearerAuth()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
        ];
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(new BadRequestException('只允许上传 JPEG/PNG/GIF/WebP 图片或 PDF 文件'), false);
        }
        callback(null, true);
      },
    }),
  )
  @ApiOperation({ summary: '上传文件' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const filePath = `/uploads/${file.filename}`;
    const fileUrl = this.uploadService.getFileUrl(filePath);

    return {
      originalName: file.originalname,
      filename: file.filename,
      path: filePath,
      url: fileUrl,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
