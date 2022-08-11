const http = require('http');
import WebSocket from 'ws';
import {socketServer} from "../src/socket/ws-server";

const MOCK_WS_PORT = 7575;
const MOCK_WS_ADDRESS = `ws://localhost:${MOCK_WS_PORT}/`;

describe('Websocket server tests', () => {
    let server;

    beforeAll(done => {
        server = http.createServer(() => {});
        socketServer(server);
        server.listen(MOCK_WS_PORT, () => {
            console.log('Mock WS server started')
            return done();
        });
    });

    afterAll(done => {
        if (server) {
            server.close(() => {
                server.unref();
            });
            done();
        }
    });

    it('Connect to server server', done => {
        const wsClient = new WebSocket(MOCK_WS_ADDRESS);
        wsClient.on('open', () => {
            console.log('Client connected')
            done();
        });
    });
})