import * as WebSocket from "ws";

export interface RoomModel {
    name: string;
    onlineUsers: { [key: string]: WebSocket };
}