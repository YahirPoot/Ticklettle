export interface AuthUser {
    id: string | number, 
    email: string, 
    name: string, 
    picture?: string,
    roles?: UserRole[],
    password?: string | null;
    isRegistered: boolean;
}

export type UserRole = 'asistente' | 'organizador' | 'user';