import express, {Express, Request, Response} from 'express'
import {v4 as uuidv4} from 'uuid';
import dotenv from 'dotenv'
import {createServer} from "http";
import * as WebSocket from 'ws';
import {RoomModel} from "./models/room.model";
import {WsMessageModel} from "./models/ws-message.model";
import {WsEventEnum} from "./enum/ws-event.enum";

dotenv.config()

const app: Express = express();
const port = process.env.PORT;

const server = createServer(app);
const wss = new WebSocket.Server({server});

// const users: UserModel[] = [];
const rooms: RoomModel[] = [];

// users.push({
//     id: uuidv4(),
//     username: 'first',
//     authToken: '111',
// })
// users.push({
//     id: uuidv4(),
//     username: 'second',
//     authToken: '222',
// })
//
// function authUser(authToken: string): UserModel {
//     return users.find(u => u.authToken === authToken)
// }
//
// function getActiveUser(userId: string): UserModel {
//     return users.find(u => u.id === userId)
// }

function findRoom(roomName: string): RoomModel {
    return rooms.find(r => r.name === roomName)
}

function createRoom(roomName: string, uuid: string, socket: WebSocket): void {
    const room: RoomModel = {
        name: roomName,
        onlineUsers: {},
    };
    room.onlineUsers[uuid] = socket;
    rooms.push(room)
}

function joinRoom(roomName: string, uuid: string, socket: WebSocket): void {
    const index = rooms.findIndex(r => r.name === roomName);
    if (index < 0) {
        return;
    }
    rooms[index].onlineUsers[uuid] = socket;
}

function leaveRoom(roomName: string, uuid: string): void {
    const index = rooms.findIndex(r => r.name === roomName);
    if (index < 0) {
        return;
    }
    delete rooms[index].onlineUsers[uuid]
}

function leaveAllRooms(uuid: string): void {
    for (const room of rooms) {
        delete room.onlineUsers[uuid]
    }
}

wss.on('connection', function connection(socket: WebSocket, req: Request) {
    const connectionId = uuidv4();
    console.log(`[${connectionId}] Connected`)
    // const wsRoom = req.url;

    socket.on('message', function message(data: WebSocket.RawData) {
        try {
            console.log(`${data}`)
            const messageObj: WsMessageModel = JSON.parse(data.toString())

            if (messageObj.event === WsEventEnum.CreateRoom) {
                createRoom(messageObj.room, connectionId, socket)
                console.log(`[${connectionId}] Created room ${messageObj.room}`)
            }

            if (messageObj.event === WsEventEnum.JoinRoom) {
                joinRoom(messageObj.room, connectionId, socket)
                console.log(`[${connectionId}] Joined room ${messageObj.room}`)
            }

            if (messageObj.event === WsEventEnum.LeaveRoom) {
                leaveRoom(messageObj.room, connectionId)
                console.log(`[${connectionId}] Left room ${messageObj.room}`)
            }

            // send message
            if (messageObj.event === WsEventEnum.ChatMessage && messageObj.message) {
                const room = findRoom(messageObj.room);
                if (room) {
                    // check loop?
                    const connectionIds = Object.keys(room.onlineUsers)
                    connectionIds.forEach(id => {
                        if (connectionId !== id) {
                            console.log(`[${connectionId}] Try sending a message ${messageObj.room}: ${messageObj.message}`)
                            room.onlineUsers[id].send(JSON.stringify({ message: messageObj.message }))
                        }
                    })
                    console.log(`[${connectionId}] Message sent ${messageObj.room}: ${messageObj.message}`)
                }
            }

        } catch (err) {
            // log
        }

    });

    socket.on("close", () => {
        leaveAllRooms(connectionId)
        console.log(`[${connectionId}] Disconnected`)
    });
});

app.get('/health', (req: Request, res: Response) => {
    res.send('Running!');
});

server.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
});