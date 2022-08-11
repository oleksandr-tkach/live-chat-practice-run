import {WsEventEnum} from "../enum/ws-event.enum";

export interface WsMessageModel {
    event: WsEventEnum;
    room: string;
    message?: string;
    authToken: string;
}