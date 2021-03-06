import {SocketServer} from "./SocketServer";
import {ServerParameters} from "../../parameters/event/ServerParameters";
import {SocketIo} from "./drivers/socket.io";

export const drivers: { [key: string]: any } = {
    [SocketIo.id]: SocketIo
};

export function isValid(driver?: string): boolean {
    if(!driver) return false;
    return Object.keys(drivers).includes(driver);
}

export function get(parameters: ServerParameters): SocketServer {
    return new drivers[parameters.driver!](parameters);
}