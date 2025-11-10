import { UserRole } from "./auth-user.interfaces";

export interface BaseRegisterRequest {
    role?: UserRole,
    email?: string,
    password: string;
}

export interface AssintantRedisterRequest extends BaseRegisterRequest {
    name: string;
}

export interface OrganizerRegisterRequest extends BaseRegisterRequest {
    razonSocial: string;
    rfc: string;
    telefono: string; 
}

export type RegisterRequest =  AssintantRedisterRequest | OrganizerRegisterRequest;