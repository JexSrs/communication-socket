import {ConnectionClientParameters} from "../../parameters/event/ConnectionClientParameters";
import {SocketClient} from "./SocketClient";
import {SocketIo} from "./drivers/socket.io";

export const drivers: { [key: string]: any } = {
    [SocketIo.id]: SocketIo
};

export function isValid(driver: string): boolean {
    return Object.keys(drivers).includes(driver);
}

export function get(parameters: ConnectionClientParameters): SocketClient {
    return new drivers[parameters.driver!](parameters);
}