import {v4 as uuidv4} from 'uuid';
import {Server} from "http";
import * as WebSocket from "ws";
import {WsMessageModel} from "../common/models/ws-message.model";
import {ERROR} from "../common/error/error";
import * as AuthService from "../user/auth.service";
import {WsEventEnum} from "../common/enum/ws-event.enum";
import * as RoomService from "../room/room.service";
import {WsResponseModel} from "../common/models/ws-response.model";
import {formatMessage} from "../helpers/format-message.helper";
import {UserModel} from "../common/models/user.model";
import {MOCK_USERS} from "../mock/mock-users";
import {RoomModel} from "../common/models/room.model";

const users: UserModel[] = [
    ...MOCK_USERS
];
const rooms: RoomModel[] = [];

export function socketServer(serverToBind: Server): void {
    const wss = new WebSocket.Server({ server: serverToBind });

    wss.on('connection', function connection(socket: WebSocket) {
        const connectionId = uuidv4();
        console.log(`[${connectionId}] Connected`)

        socket.on('message', function message(data: WebSocket.RawData) {
            try {
                let messageObj: WsMessageModel;
                try {
                    messageObj = JSON.parse(data.toString())
                } catch (err) {
                    throw new Error(ERROR.socket.invalidData)
                }

                const { authToken, event, room: roomName, message } = messageObj;

                if (!authToken) {
                    throw new Error(ERROR.socket.missingToken)
                }

                const initiator = AuthService.authUser(users, authToken)

                if (!event) {
                    throw new Error(ERROR.socket.missingEvent)
                }

                if (event === WsEventEnum.CreateRoom) {
                    RoomService.createRoom(rooms, roomName, connectionId, socket)
                    console.log(`[${connectionId}] Created room ${roomName}`)
                }

                if (event === WsEventEnum.JoinRoom) {
                    RoomService.joinRoom(rooms, roomName, connectionId, socket)
                    console.log(`[${connectionId}] Joined room ${roomName}`)
                }

                if (event === WsEventEnum.LeaveRoom) {
                    RoomService.leaveRoom(rooms, roomName, connectionId)
                    console.log(`[${connectionId}] Left room ${roomName}`)
                }

                // send message
                if (event === WsEventEnum.ChatMessage) {
                    if (!message) {
                        throw new Error(ERROR.socket.emptyMessage)
                    }

                    const room = RoomService.findRoom(rooms, roomName);
                    if (room) {
                        const connectionIds = Object.keys(room.onlineUsers)
                        connectionIds.forEach(id => {
                            if (connectionId !== id) {
                                console.log(`[${connectionId}] Try sending a message ${room}: ${message}`)
                                const broadcastMessage: WsResponseModel = {
                                    message: formatMessage(message, initiator),
                                    status: 1
                                };
                                room.onlineUsers[id].send(JSON.stringify(broadcastMessage))
                            }
                        })
                        console.log(`[${connectionId}] Message sent ${roomName}: ${message}`)
                    }
                }
            }   catch (err) {
                console.error(err.message)
                const error: WsResponseModel = {
                    message: err.message,
                    status: 0,
                };
                socket.send(JSON.stringify(error))
            }
        });

        socket.on("close", () => {
            RoomService.leaveAllRooms(rooms, connectionId)
            console.log(`[${connectionId}] Disconnected`)
        });
    });
}