import 'multer';

export const I_STORAGE_SERVICE = 'IStorageService';

export interface IStorageService {
    uploadImage(file: Express.Multer.File): Promise<string>;
}