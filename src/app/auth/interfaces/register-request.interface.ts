export interface AttendeeRegisterRequest {
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    dateOfBirth: string,
    gender: string,
    photoUrl: string | File
}

export interface OrganizerRegisterRequest {
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    photoUrl: string,
    company: string,
    taxId: string,
    fiscalAddress: string,
    organizingHouseName: string,
    organizingHouseAddress: string,
    organizingHouseContact: string,
    organizingHouseTaxData: string
}

export type RegisterRequest = AttendeeRegisterRequest | OrganizerRegisterRequest