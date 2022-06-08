import {ServerOptions} from "socket.io";

export interface ServerParameters {
    driver?: string;
    port: number;
    key: string;
    refuseUnsignedId?: boolean;
    onFailedAuthentication?: 'keep' | 'disconnect';
    socketio?: Partial<ServerOptions>;
}