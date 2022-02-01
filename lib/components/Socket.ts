import {EmitFlags} from "./EmitFlags";
import {parseIn, parseOut} from "../modules/utils";
import {EncryptionParameters} from "../parameters/EncryptionParameters";
import {CompressionParameters} from "../parameters/CompressionParameters";

export abstract class Socket {
    /** The client's id. */
    declare id: string
    /** The extra data that the client sent during connection. */
    declare extra: string
    /** IP Address. */
    declare address: string
    /** The connection data. */
    declare connectData: string
    /** All the client's information about the authorization. */
    declare auth: {
        /** The public key. */
        key: string,
        /** The token string or object */
        token: string
    }

    private flags: EmitFlags = {};
    decKey: string = "";
    declare parameters: {
        encryption: EncryptionParameters,
        compression: CompressionParameters
    }

    /**
     * Set a timeout for the next emit.
     * @param timeout Time in milliseconds.
     * @return self.
     */
    timeout(timeout: number): Socket {
        this.flags.timeout = timeout;
        return this;
    }

    /**
     * Sets a volatile flag for the next emit.
     * If the socket is not ready to send messages, then the event message will be dropped.
     * @return self
     */
    get volatile(): Socket {
        this.flags.volatile = true;
        return this;
    }

    abstract disconnect(): void;

    async emit(event: string, data: string, callback?: (data?: string, err?: any) => void) {
        // Save given key to parameters for encryption
        if(!this.parameters.encryption.disable)
            this.parameters.encryption.asymmetric!!.key = this.auth.key;

        let out = JSON.stringify(parseOut(
            data,
            this.parameters.encryption,
            this.parameters.compression
        ));

        if(callback)
            await this._emit(event, out, async (data?: string, err?: any) => {
                if(err) return callback(data, err);
                data = data!!;

                try {
                    let parsedIn = parseIn(data, this.decKey);
                    callback(parsedIn.data);
                }
                catch (e) {
                    callback(data, e);
                }
            }, this.flags);
        else await this._emit(event, out, undefined, this.flags);

        this.flags = {};
    }

    on(event: string, callback: (data?: string, callback?: (data: string) => void, err?: any) => void) {
        if(this.reservedEvents.includes(event)){
            this._on(event, callback)
            return;
        }

        this._on(event, async (data: string, cb?: (data: string) => void) => {
            let encCallback: ((data: string) => void) | undefined = undefined;

            if (cb)
                encCallback = (data) => {
                    // Save given key to parameters for encryption
                    if(!this.parameters.encryption.disable)
                        this.parameters.encryption.asymmetric!!.key = this.auth.key;

                    let out = JSON.stringify(parseOut(data, this.parameters.encryption, this.parameters.compression));
                    cb(out);
                };

            try {
                let incoming = parseIn(data, this.decKey);
                callback(incoming.data, encCallback);

                // On new socket emit save new parameters
                this.parameters = incoming.headers;
            }
            catch (e) {
                callback(data, encCallback, e);
            }
        });
    }

    protected abstract _emit(event: string, data: string, callback?: (data?: string, err?: any) => void, flags?: EmitFlags): Promise<void>;

    protected abstract _on(event: string, callback: (data: string, cb?: (data: string) => void) => void): void;

    abstract off(event?: string): void

    abstract get reservedEvents(): string[];
}