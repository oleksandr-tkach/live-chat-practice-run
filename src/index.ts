import express, {Express, Request, Response} from 'express'
import {v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv'
import {createServer} from "http";
import * as WebSocket from 'ws';
import {RoomModel} from "./common/models/room.model";
import {WsMessageModel} from "./common/models/ws-message.model";
import {WsEventEnum} from "./common/enum/ws-event.enum";
import {UserModel} from "./common/models/user.model";
import {WsResponseModel} from "./common/models/ws-response.model";
import {MOCK_USERS} from "./mock/mock-users";
import * as RoomService from "./room/room.service";
import * as AuthService from "./user/auth.service";
import {ERROR} from "./common/error/error";

dotenv.config()

const app: Express = express();
const port = process.env.PORT;

const server = createServer(app);
const wss = new WebSocket.Server({server});

const users: UserModel[] = [
    ...MOCK_USERS
];
const rooms: RoomModel[] = [];

function formatMessage(message: string, initiator: UserModel): string {
    return `${initiator.username}: ${message}`
}

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

app.get('/health', (req: Request, res: Response) => {
    res.send('Running!');
});

server.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
});