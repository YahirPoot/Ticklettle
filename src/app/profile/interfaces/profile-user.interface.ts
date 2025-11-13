export interface ProfileUser{
    attendeeId: number;
    userId: string;
    dateOfBirth: string;
    gender: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        customRole: number;
        createdAt: string; 
        photoUrl: string;
    }
}