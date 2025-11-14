import { User } from "../../auth/interfaces";

export interface ProfileUserResponse {
    organizerId: number;
    userId: string;
    company: string;
    taxId: string;
    fiscalAddress: string;
    user: User;
    organizingHouses?: OrganizingHouse[];
}

export interface OrganizingHouse {
    organizingHouseId: number;
    name: string;
    address: string;
    contact: string;
    taxData: string;
    organizerId: number;
    eventCount: number;
}
