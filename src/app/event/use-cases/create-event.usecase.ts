import { inject, Injectable } from "@angular/core";
import { ImageCloudinaryUploadService } from "../../shared/services/image-cloudinary-upload.service";
import { EventService } from "../services/event.service";
import { CreateEventFormValue, CreateEventRequest } from "../interfaces";
import { firstValueFrom } from "rxjs";
import { ProfileService } from "../../profile/services/profile.service";
import { mapFormToCreateEventRequest } from "../mappers/map-form-to-request";
import { UploadImageUseCase } from "../../shared/use-cases/upload-image-use-case";

@Injectable({ providedIn: 'root'  })
export class CreateEventUseCase {
    private imageUploadUseCase = inject(UploadImageUseCase);
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
            imageUrl = await this.imageUploadUseCase.execute(eventImageFile);
        }

        // Subimos las imagenes de los productos si existen
        // Lo que pide el use-case son los ficheros, no las URLs, así que las subimos aquí
        // Pedimos 4 subidas concurrentes y 1 reintento por fichero
        const productsImgUrls = await this.imageUploadUseCase.uploadAll(productsFiles, 4, 1);

        const request = mapFormToCreateEventRequest(formValue, imageUrl, productsImgUrls, organizingHouseId);
        await firstValueFrom(this.eventService.createEvent(request));
    }   
}