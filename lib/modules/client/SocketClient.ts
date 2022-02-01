import {ConnectionClientParameters} from "../../parameters/event/ConnectionClientParameters";
import {EmitFlags} from "../../components/EmitFlags";

export abstract class SocketClient {
    protected constructor(readonly parameters: ConnectionClientParameters) {}

    abstract connect(connData: string): Promise<void>;

    abstract disconnect(): Promise<void>;

    abstract emit(event: string, data: string, callback?: (data?: string, err?: any) => void, flags?: EmitFlags): Promise<void>;

    abstract on(event: string, callback: (data: string, cb?: (data: string) => void) => void): void;

    abstract offEvent(event: string): void

    abstract offAll(): void

    abstract get reservedEvents(): string[];
}