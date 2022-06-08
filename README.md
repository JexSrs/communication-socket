# Encrypted Socket Communication

This is a driver based TypeScript library that adds a layer of encryption above [socket.io](https://socket.io/).

## Installation
```shell
# Add repository as dependency 
```

## How to use?

### Server

#### Create server instance

```javascript
import { Server } from "socket-communication";

const server = new Server({ /* options */ });
```

#### Add verification
When client tries to establish a connection to the server, a token may accompany the client socket.
That token can be verified by calling `setConnectVerification`. If not set, it defaults to always
`true`. It also supports asynchronous code.

```javascript
server.setConnectVerification(socket => {
    return socket.auth.token === 'mytoken';
});
```

#### Incoming connection
Call the `onConnection` function to listen incoming connections.

```javascript
server.onConnection((socket, err) => {
    // An error occurred during connection
    // E.x. token authentication failed
    if(err) {
        console.log(err);
        return;
    }
    
    // Client connected
    console.log(`Socket ${socket.id} sent with connection:`, socket.extra);
    
    // Register socket events
    socket.on('dinoEvent', (data, callback, err1) => {
        // ...
    });
});
```

#### Start server
```javascript
server.listen(() => {
    console.log('Server is listening.')
});
```

### Client

#### Create server instance

```javascript
import { Client } from "socket-communication";

const client = new Client({ /* options */ });
```

#### Register events
All socket.io events like `connect` are available to use.
```javascript
client.on("connect", () => {
  client.emit("dinoEvent", "string-data");
});
```

#### Connect to the server

```javascript
// Set a header string that will accompany the connection.
// Can be accessed from the server using socket.extra
client.setExtra("Extra string during connection");

// Connect to the server
client.connect();
// or
// to assign custom id
client.connect("custom-id");
```

## Server options

### `driver`
Default value: `socket.io`

The server driver that will be used for event type communication.

Available values: `socket.io`

### `port`
Default value: no default value

The port where the event server will be listening.

### `onFailedAuthentication`
Default value: `disconnect`

In case where the client authentication has failed, if the socket will be disconnected or not.
Available values: `disconnect`, `keep`

### `socketio`
Default value: Socket.IO default options

A set of Socket.IO (server) options that will be passed to the Socket.IO driver.
For more information look at the official [socket.io](https://socket.io/docs/v4/server-options/) documentation.

## Client options

### `connection.driver`
Default value: `socket.io`

The client driver that will be used for event type communication.

Available values: `socket.io`

### `connection.address`
The address where the event client will connect.

### `connection.token`
The token that will be used for authenticating the connection.

### `connection.socketio`
Default value: Socket.IO default options

A set of Socket.IO (client) options that will be passed to the Socket.IO driver.
For more information look at the official [socket.io](https://socket.io/docs/v4/client-options/) documentation.

### `encryption.disable`
Default value: `false`

If `true` encryption will not be applied to outgoing data.

### `encryption.asymmetric.driver`
The asymmetric encryption driver that will be used.

Acceptable values: `rsa`

### `encryption.asymmetric.key`
The server's public key that will encrypt the outgoing data.

### `encryption.asymmetric.bits`
The key size (in bits) of the above key and the size of the keys that the client will generate.

### `encryption.symmetric.driver`
The symmetric encryption driver that will be used.

Acceptable values: `aes-128-gcm`

### `compression.disable`
Default value: `true`

NOT IMPLEMENTED YET

If `true` compression will not be applied to outgoing data.

### `compression.driver`
NOT IMPLEMENTED YET

The compression driver that will be used.

## Write your own driver

In case none of the above drivers fulfills your needs, there is nothing to worry about.
Just follow the steps [here](./docs/main.md), so you can write your own encryption driver.
