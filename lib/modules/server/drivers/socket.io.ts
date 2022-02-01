import {SocketServer} from "../SocketServer";
import {Socket} from "../../../components/Socket";
import {EmitFlags} from "../../../components/EmitFlags";
import {Server, Socket as ioSocket} from "socket.io";
import http from "http";
import {ServerParameters} from "../../../parameters/event/ServerParameters";


export class SocketIoSocket extends Socket {

    declare socket: ioSocket

    constructor(socket: ioSocket) {
        super();
        this.socket = socket;

        this.connectData = socket.request.headers.conn_data as string;
        this.address = socket.handshake.address;
    }

    async _emit(event: string, data: string, callback?: (data?: string, err?: any) => void, flags?: EmitFlags): Promise<void> {
        let sock = this.socket.compress(false);

        if (flags?.volatile) sock = sock.volatile;
        if (flags?.timeout) sock = sock.timeout(flags.timeout);

        if (callback)
            sock.emit(event, data, (...args: any[]) => {
                if (flags?.timeout) {
                    let error = args[0];
                    if (error)
                        return callback(undefined, error);

                    callback(args[1]);
                }
            });
        else sock.emit(event, data);
    }

    off(event?: string): void {
        this.socket.removeAllListeners(event);
    }

    _on(event: string, callback: (data: string, cb?: (data: string) => void) => void): void {
        this.socket.on(event, (...args: any[]) => {
            // Skip all args in the middle, if there are any.
            // We only care for the first arguments which is the data and the last that is the callback (if exists).
            let lastIndex = args.length - 1;
            if (lastIndex == 0 || typeof args[lastIndex] !== 'function')
                return callback(args[0]);

            callback(args[0], args[lastIndex]);
        })
    }

    disconnect() {
        this.socket.disconnect(true);
    }

    get reservedEvents(): string[] {
        return [
            'connect',
            'connect_error',
            'disconnect',
            'disconnecting',
            'newListener',
            'removeListener',
        ];
    }
}

export class SocketIo extends SocketServer {

    static id: string = 'socket.io';

    declare httpServer: http.Server;
    declare io: Server

    declare sockets: SocketIoSocket[];

    constructor(parameters: ServerParameters) {
        super(parameters);

        this.sockets = [];

        this.httpServer = http.createServer();
        this.io = new Server(this.httpServer, this.parameters.socketio);
        this.io.on('connection', socket => {
            let sock = new SocketIoSocket(socket);
            this.sockets.push(sock);

            socket.on('disconnect', () => {
                let index = this.sockets.findIndex(s => s.socket.id == socket.id);
                this.sockets.splice(index, 1);
            })

            for (let call of this.connectionCallbacks)
                call(sock);
        })
    }

    close() {
        this.httpServer.close();
    }

    listen(callback: () => void) {
        this.httpServer.listen(this.parameters.port, callback);
    }
}