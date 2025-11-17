import { User } from "./user.interface";

export interface LoginResponse{
    token: string,
    expiration: string,
    user: User
    requiresAdditionalInfo: boolean,
    isValidGoogleToken: boolean,
    message: string | null,
}