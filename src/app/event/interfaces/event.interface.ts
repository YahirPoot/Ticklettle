export interface Event {
    id: string | number;
    title: string;
    description: string;
    image: string;
    date: string;     
    location: string;
    organizer: string;
    tags?: string[];
    featured?: boolean;
    popular?: boolean;
}