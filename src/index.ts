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


function findRoom(roomName): RoomModel {
    return rooms.find(r => r.name === roomName)
}

function createRoom(roomName):void {
    const room: RoomModel = {
        name: roomName,
        onlineUsers: [],
    };
    rooms.push(room)
}

// function joinRoom(roomName: string, userId): void {
//     const index = rooms.findIndex(r => r.name === roomName);
//     if (index < 0) {
//         return;
//     }
//     if (!rooms[index].onlineUsers.includes(userId)) {
//         rooms[index].onlineUsers.push(userId)
//     }
// }
//
// function leaveRoom(roomName: string, userId): void {
//     const index = rooms.findIndex(r => r.name === roomName);
//     if (index < 0) {
//         return;
//     }
//     rooms[index].onlineUsers =  rooms[index].onlineUsers.filter(e => e !== userId)
// }

wss.on('connection', function connection(socket: WebSocket, req: Request) {
    const connectionId = uuidv4();
    console.log(connectionId)
    const wsRoom = req.url;

    if (wsRoom) {
        // join room
    }

    socket.on('message', function message(data: WebSocket.RawData) {
        console.log('received: "%s"', data);
        const messageObj: WsMessageModel = JSON.parse(data.toString())
        try {
            const messageObj: WsMessageModel = JSON.parse(data.toString())

            if (messageObj.event === WsEventEnum.CreateRoom) {
                createRoom(messageObj.message)
            }

            // send message
            if (messageObj.event === WsEventEnum.ChatMessage) {
                const room = findRoom(messageObj.room);
                if (room) {
                    // check loop?
                    room.onlineUsers.forEach(s => s.send({ message: messageObj.message }))
                }

                // wss.clients.forEach(function each(client) {
                //     const isOpen = client.readyState === WebSocket.OPEN;
                //     const sameRoom = client.roomId === messageObj.room;
                //     if (client !== ws && isOpen && sameRoom) {
                //         client.send(`Message: ${messageObj.message}`);
                //     }
                // });
            }

        }   catch (err) {
            console.log('Wrong message')
        }

    });
});

// io.use(function (socket, next) {
//     const token = socket.handshake.query?.token as string;
//     if (!token) {
//         next(new Error('Authentication error'));
//     }
//     const user = authUser(token)
//     if (!user) {
//         next(new Error('User was not found'));
//     }
// })
//     .on('connection', socket => {
//
//         socket.on(EventNameEnum.CreateRoom, (roomName) => {
//             createRoom(roomName)
//             joinRoom(roomName, socket.id)
//             socket.join(roomName);
//         })
//
//         socket.on(EventNameEnum.SubscribeRoom, (roomName) => {
//             joinRoom(roomName, socket.id)
//             socket.join(roomName);
//         })
//
//         socket.on(EventNameEnum.UnsubscribeRoom, ({ roomName }) => {
//             leaveRoom(roomName, socket.id)
//             socket.leave(roomName);
//         })
//
//         socket.on(EventNameEnum.ChatMessage, ({ roomName, msg }) => {
//             const user = getActiveUser(socket.id);
//             // @TODO check if user is in room
//             io.to(roomName).emit('message', `${user.username}: ${msg}`);
//         });
//     });

app.get('/health', (req: Request, res: Response) => {
    res.send('Running!');
});

server.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
});