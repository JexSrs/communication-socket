import {Socket} from "../../components/Socket";
import {ServerParameters} from "../../parameters/event/ServerParameters";

export abstract class SocketServer {

    declare connectionCallbacks: ((socket: Socket) => void)[];

    protected constructor(readonly parameters: ServerParameters) {
        this.connectionCallbacks = [];
    }

    onConnection(callback: (socket: Socket) => void) {
        this.connectionCallbacks.push(callback);
    }

    abstract listen(callback: () => void): void

    abstract close(): void
}