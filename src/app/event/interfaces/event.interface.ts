export interface EventInterface {
    eventId: number;
    name: string;
    description: string;
    dateTime: string;
    location: string;
    type: string;
    status: string;
    imageUrl: string | null;
    organizingHouseId: number;
    createdAt: string;
}