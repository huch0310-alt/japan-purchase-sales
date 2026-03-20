import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as COS from 'cos-nodejs-sdk-v5';

/**
 * 文件上传服务
 * 支持本地存储和腾讯云COS存储
 */
@Injectable()
export class UploadService {
  private cos: COS;
  private bucket: string;
  private region: string;

  constructor(private configService: ConfigService) {
    this.initCos();
  }

  /**
   * 初始化COS客户端
   */
  private initCos() {
    const secretId = this.configService.get('TENCENT_COS_SECRET_ID');
    const secretKey = this.configService.get('TENCENT_COS_SECRET_KEY');
    this.bucket = this.configService.get('TENCENT_COS_BUCKET');
    this.region = this.configService.get('TENCENT_COS_REGION', 'ap-tokyo');

    if (secretId && secretKey && this.bucket) {
      this.cos = new COS({
        SecretId: secretId,
        SecretKey: secretKey,
      });
    }
  }

  /**
   * 获取上传目录
   */
  getUploadDir(): string {
    return this.configService.get('UPLOAD_DIR', './uploads');
  }

  /**
   * 确保上传目录存在
   */
  async ensureUploadDir(): Promise<void> {
    const uploadDir = this.getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  }

  /**
   * 获取文件URL
   */
  getFileUrl(filePath: string): string {
    const baseUrl = this.configService.get('BASE_URL', 'http://localhost:3001');
    return `${baseUrl}${filePath}`;
  }

  /**
   * 删除文件
   */
  async deleteFile(filePath: string): Promise<void> {
    // 如果是COS URL，删除COS文件
    if (filePath.includes('cos.')) {
      await this.deleteFromCos(filePath);
      return;
    }

    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  /**
   * 腾讯云COS上传
   * 需要配置TENCENT_COS相关环境变量
   */
  async uploadToCos(file: any): Promise<string> {
    if (!this.cos) {
      throw new Error('腾讯云COS未配置');
    }

    const key = `uploads/${Date.now()}-${file.originalname}`;

    return new Promise((resolve, reject) => {
      this.cos.putObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
        Body: fs.createReadStream(file.path),
        onProgress: (progress) => {
          console.log('上传进度:', progress.percent);
        },
      }, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(`https://${this.bucket}.cos.${this.region}.myqcloud.com/${key}`);
        }
      });
    });
  }

  /**
   * 从COS删除文件
   */
  async deleteFromCos(fileUrl: string): Promise<void> {
    if (!this.cos) {
      throw new Error('腾讯云COS未配置');
    }

    // 从URL中提取Key
    const key = fileUrl.replace(`https://${this.bucket}.cos.${this.region}.myqcloud.com/`, '');

    return new Promise((resolve, reject) => {
      this.cos.deleteObject({
        Bucket: this.bucket,
        Region: this.region,
        Key: key,
      }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 判断是否使用COS存储
   */
  isCosConfigured(): boolean {
    return !!this.cos;
  }
}
