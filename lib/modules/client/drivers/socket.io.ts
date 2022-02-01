import {SocketClient} from "../SocketClient";
import {ConnectionClientParameters} from "../../../parameters/event/ConnectionClientParameters";
import io, {Socket} from "socket.io-client";
import {EmitFlags} from "../../../components/EmitFlags";

export class SocketIo extends  SocketClient {

    static id: string = 'socket.io';

    declare socket: Socket

    constructor(parameters: ConnectionClientParameters) {
        super(parameters);

        if(!this.parameters["socketio"])
            this.parameters["socketio"] = { autoConnect: false }
        else this.parameters["socketio"]!!.autoConnect = false;

        this.socket = io(
          this.parameters.address,
          this.parameters["socketio"]
        );
    }

    async connect(connData: string): Promise<void> {
        if(this.socket.io.opts.extraHeaders)
            this.socket.io.opts.extraHeaders.conn_data = connData;
        else this.socket.io.opts.extraHeaders = {conn_data: connData};

        // Connect
        this.socket.connect()
    }

    async disconnect(): Promise<void> {
        this.socket.disconnect();
    }

    async emit(event: string, data: string, callback?: (data?: string, err?: any) => void, flags?: EmitFlags): Promise<void> {
        let sock = this.socket.compress(false);

        if(flags?.volatile) sock = sock.volatile;
        if(flags?.timeout) sock = sock.timeout(flags.timeout);

        if(callback)
            sock.emit(event, data, (...args: any[]) => {
                if(flags?.timeout) {
                    let error = args[0];
                    if(error)
                        return callback(undefined, error);

                    callback(args[1]);
                }
            });
        else sock.emit(event, data);
    }

    offAll(): void {
        this.socket.removeAllListeners();
    }

    offEvent(event: string): void {
        this.socket.removeListener(event);
    }

    on(event: string, callback: (data: string, cb?: (data: string) => void) => void): void {
        this.socket.on(event, (...args: any[]) => {
            // Skip all args in the middle, if there are any.
            // We only care for the first arguments which is the data and the last that is the callback (if exists).
            let lastIndex = args.length - 1;
            if(lastIndex == 0 || typeof args[lastIndex] !== 'function')
                return callback(args[0]);

            callback(args[0], args[lastIndex]);
        });
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