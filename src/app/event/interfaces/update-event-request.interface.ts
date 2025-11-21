export interface UpdateEventRequest {
    // eventId: number;
    name: string;
    description: string;
    dateTime: string; // ISO 8601 format
    location: string;
    type: string;
    status: string;
    imageUrl: string; // URL to the event image (se obtitene del servidor de imágenes: 1.- subir la imagen (imageUploadService), 2.- obtener la URL)
}
