export interface AuthUser {
    id: string | number, 
    email: string, 
    name: string, 
    picture?: string,
    roles: UserRole[],
    isRegistered: boolean;
}

export type UserRole = 'asistente' | 'organizador' | 'user';