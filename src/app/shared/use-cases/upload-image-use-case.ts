import { inject, Injectable } from '@angular/core';
import { ImageCloudinaryUploadService } from '../services/image-cloudinary-upload.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UploadImageUseCase {
    private imageUploadService = inject(ImageCloudinaryUploadService);

    // Devuelve la URL de la imagen subida a Cloudinary (o cadena vacía en caso de fallo) file: Tipo de dato File, retries: número de reintentos
    async execute(file: File, retries = 1): Promise<string> {
        const formData = new FormData();
        formData.append('imageFile', file, file.name);
        for (let attempt =0; attempt <= retries; attempt++) {
            const res = await firstValueFrom(this.imageUploadService.uploadImageToCloudinary(formData));
            return res.url;
        }
        return '';
    }

     // Devuelve un array de strings (misma longitud que files). Para elementos nulos devuelve ''.
    //  files: array de ficheros (File | null | undefined), concurrency: número de subidas concurrentes, retries: número de reintentos por fichero
    async uploadAll(files: (File | null | undefined)[], concurrency = 4, retries = 1): Promise<string[]> {
        const n = files.length;
        const results: string[] = new Array(n).fill('');
        for (let i = 0; i < n; i += concurrency) {
            const batchIdx = Array.from({ length: Math.min(concurrency, n - i) }, (_, k) => i + k);
            const batchPromises = batchIdx.map(idx => {
                const f = files[idx];
                if (!f) return Promise.resolve<string>('');
                return this.execute(f, retries).then(url => url).catch(() => '');
            });
            const batchRes = await Promise.all(batchPromises);
            batchRes.forEach((url, j) => {
                results[i + j] = url ?? '';
            });
        }
        return results;
    }
}