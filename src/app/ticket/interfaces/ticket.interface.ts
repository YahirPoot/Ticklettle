import { EventInterface } from "../../event/interfaces";
import { TypeTicketInterface } from "./type-ticket.interface";

export interface TicketInterface{
    ticketId: number,
    type: string,
    price: number,
    status: string,
    googleWalletObjectId: string,
    isEligibleForGoogleWallet: boolean,
    googleWalletSaveLink: string,
    uniqueCode: string,
    purchaseDate: string,
    attendeeId: number,
    ticketTypeId: number,
    event: EventInterface,
    ticketTypes: TypeTicketInterface[],
    entry: null
}
