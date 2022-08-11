import {RoomModel} from "../common/models/room.model";
import * as WebSocket from "ws";

export const findRoom = function (rooms: RoomModel[], roomName: string): RoomModel {
    return rooms.find(r => r.name === roomName)
}

export const createRoom = function (rooms: RoomModel[], roomName: string, uuid: string, socket: WebSocket): void {
    const room: RoomModel = {
        name: roomName,
        onlineUsers: {},
    };
    room.onlineUsers[uuid] = socket;
    rooms.push(room)
}

export const joinRoom = function (rooms: RoomModel[], roomName: string, uuid: string, socket: WebSocket): void {
    const index = rooms.findIndex(r => r.name === roomName);
    if (index < 0) {
        return;
    }
    rooms[index].onlineUsers[uuid] = socket;
}

export const leaveRoom = function (rooms: RoomModel[], roomName: string, uuid: string): void {
    const index = rooms.findIndex(r => r.name === roomName);
    if (index < 0) {
        return;
    }
    delete rooms[index].onlineUsers[uuid]
}

export const leaveAllRooms = function (rooms: RoomModel[], uuid: string): void {
    for (const room of rooms) {
        delete room.onlineUsers[uuid]
    }
}