import {ManagerOptions} from "socket.io-client";

export interface ConnectionClientParameters {
    token: string;
    driver: string;
    address: string;
    socketio?: Partial<ManagerOptions>;
}