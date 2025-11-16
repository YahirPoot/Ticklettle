export interface AttendeeRegisterRequest {
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    dateOfBirth: string,
    gender: string,
    photoUrl: string | File
    googleToken?: string
    isGoogleRegistration?: boolean
}

export interface OrganizerRegisterRequest {
    email: string,
    firstName: string | '',
    lastName: string | '',
    password: string | '',
    photoUrl: string | '',
    company: string | '',
    taxId: string | '',
    fiscalAddress: string | '',
    organizingHouseName: string | '',
    organizingHouseAddress: string | '',
    organizingHouseContact: string | '',
    organizingHouseTaxData: string | '',
    googleToken?: string | '',
    isGoogleRegistration?: boolean | ''
}

export interface GoogleRegisterRequest {
    id: number | null, 
    email: string,
    name: string,
    idToken: string,
    // photoUrl: string,
    provider: 'GOOGLE'
}

export type RegisterRequest = AttendeeRegisterRequest | OrganizerRegisterRequest | GoogleRegisterRequest