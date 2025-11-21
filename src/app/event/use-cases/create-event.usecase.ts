import { inject, Injectable } from "@angular/core";
import { ImageCloudinaryUploadService } from "../../shared/services/image-cloudinary-upload.service";
import { EventService } from "../services/event.service";
import { CreateEventFormValue, CreateEventRequest } from "../interfaces";
import { firstValueFrom } from "rxjs";
import { ProfileService } from "../../profile/services/profile.service";
import { mapFormToCreateEventRequest } from "../mappers/map-form-to-request";

@Injectable({ providedIn: 'root'  })
export class CreateEventUseCase {
    private imageUploadSvc = inject(ImageCloudinaryUploadService);
    private readonly eventService = inject(EventService);
    private readonly profileService = inject(ProfileService);

    async execute(params: {
        formValue: CreateEventFormValue,
        eventImageFile?: File | null,
        productsFiles?: (File | null)[]
    }): Promise<void> {
        const { formValue, eventImageFile, productsFiles = [] } = params;

        // Primero obtenemos los datos del usuario
        const profileUser = await firstValueFrom(this.profileService.getProfileUser());
        const organizingHouseId = profileUser.organizerId;
        if (!organizingHouseId) {
            throw new Error('El usuario no tiene una casa organizadora asociada.');
        }

        // Subimos la imagen del evento si existe;
        let imageUrl = '';
        if (eventImageFile) {
            const imageFile = new FormData();
            imageFile.append('imageFile', eventImageFile, eventImageFile.name );
            const uploadResult = await firstValueFrom(this.imageUploadSvc.uploadImageToCloudinary(imageFile));
            imageUrl = uploadResult.url ?? '';
        }

        // Subimos las imagenes de los productos si existen
        const prodcutsImgUrls: string[] = [];
        // Hacemos un ciclo 
        for (let i = 0; i < (formValue.products || []).length; i++) {
            const file = productsFiles[i];
            let url = formValue.products[i].imageUrl || '' ;
            if (file) {
                const fd = new FormData();
                fd.append('imageFile', file, file.name);
                const uploadRes = await firstValueFrom(this.imageUploadSvc.uploadImageToCloudinary(fd));
                url = uploadRes.url ?? '';
            }
            prodcutsImgUrls.push(url);
        }

        const request = mapFormToCreateEventRequest(formValue, imageUrl, prodcutsImgUrls, organizingHouseId);
        await firstValueFrom(this.eventService.createEvent(request));
    }   
}