## Requirements
* [Node.js](https://nodejs.org/en/) - requires version v16.13.2

## Installation

```bash
$ npm install
```

## Configuration

Create a new .env file in the project root directory. Copy content from .env-example file to the new .env file and change environment variables.

## Running the app

```bash
# watch mode
$ npm run start:dev
```

## Test

```bash
# watch mode
$ npm run test
```

## Socket messaging examples:
```bash
# create a room
{
   "room": "${room-name}",
   "event": "create-room",
   "authToken": "${auth-token}"
}
# join a room
{
   "room": "${room-name}",
   "event": "join-room",
   "authToken": "${auth-token}"
}
# leave a room
{
   "room": "${room-name}",
   "event": "leave-room",
   "authToken": "${auth-token}"
}
# send a message
{
   "room": "${room-name}",
   "event": "room-message",
   "message": "${message}",
   "authToken": "${auth-token}"
}
```

## Stay in touch
- Author - Oleksandr Tkach