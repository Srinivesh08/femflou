import fs from 'fs';
import path from 'path';

export interface StorageProvider {
  save(fileBuffer: Buffer, filename: string): Promise<string>;
  getUrl(filename: string): string;
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async save(fileBuffer: Buffer, filename: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, fileBuffer);
    return this.getUrl(filename);
  }

  getUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}

export const storageService = new LocalStorageProvider();
