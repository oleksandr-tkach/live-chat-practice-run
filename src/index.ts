import express, {Express, Request, Response} from 'express'
import dotenv from 'dotenv'
import {createServer} from "http";
import {socketServer} from "./socket/ws-server";

dotenv.config()

const app: Express = express();
const port = process.env.PORT;

const server = createServer(app);
socketServer(server)

app.get('/health', (req: Request, res: Response) => {
    res.send('Running!');
});

server.listen(port, () => {
    console.log(`Server is running at https://localhost:${port}`);
});