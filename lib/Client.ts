import {ClientParameters} from "./parameters/event/ClientParameters";
import {isValid as isConDrVal, get as getConDriver} from "./modules/client";
import {isValid as isAsymDrVal, get as getAsymDriver} from "./modules/encrypt/asymmetric"
import {isValid as isSymDrVal} from "./modules/encrypt/symmetric"
import {isValid as isComDrVal} from "./modules/compress"
import {KeyPair} from "./components/KeyPair";
import {parseIn, parseOut} from "./modules/utils";
import {SocketClient} from "./modules/client/SocketClient";
import {EmitFlags} from "./components/EmitFlags";

export class Client {

    private extra?: string;
    private declare keys: KeyPair;
    private declare readonly connDriver: SocketClient
    private flags: EmitFlags = {};


    constructor(readonly parameters: ClientParameters) {
        if(typeof this.parameters.compression.disable === 'undefined')
            this.parameters.compression.disable = false;

        if(!this.parameters.compression.disable) {
            if (!isComDrVal(parameters.compression.driver)) throw new Error(`compression.driver '${parameters.compression.driver}' is invalid.`);
        }

        if(typeof this.parameters.connection.driver === 'undefined')
            this.parameters.connection.driver = 'socket.io';

        if(parameters.connection.token.length == 0) throw new Error('connection.token cannot be empty');
        if(!isConDrVal(parameters.connection.driver!)) throw new Error(`connection.driver '${parameters.connection.driver}' is invalid.`);
        if(parameters.connection.address.length == 0) throw new Error('connection.address cannot be empty.');

        if(!parameters.encryption.disable) {
            if(!isAsymDrVal(parameters.encryption.asymmetric?.driver)) throw new Error(`encryption.asymmetric.driver '${parameters.encryption.asymmetric?.driver}' is not valid.`);
            if(parameters.encryption.asymmetric!!.bits <= 0) throw new Error('encryption.asymmetric.bits cannot be negative or zero.');

            let error = getAsymDriver(parameters.encryption)!!.isKeyValid(parameters.encryption.asymmetric?.key);
            if(error.length !== 0) throw new Error(`encryption.asymmetric.key is not valid. ${error}`);

            if(parameters.encryption.asymmetric!!.key?.length == 0) throw new Error('encryption.asymmetric.server_key cannot be empty');
            if(!isSymDrVal(parameters.encryption.symmetric?.driver)) throw new Error(`encryption.symmetric.driver '${parameters.encryption.symmetric?.driver}' is not valid.`);
        }

        this.parameters.compression.disable = true;

        this.connDriver = getConDriver(this.parameters.connection);
    }

    /**
     * Set an extra string that will be sent to the server during connection.
     * Will not be nulled after a connection.
     * @param extra
     */
    setExtra(extra: string) {
        this.extra = extra;
    }

    /** Establish a connection with server. */
    async connect(id?: string) {
        if(!this.parameters.encryption.disable)
            this.keys = getAsymDriver(this.parameters.encryption)!!.generateKeys();
        else this.keys = {privateKey: '', publicKey: ''};

        let validationData: any = {
            id,
            token: this.parameters.connection.token
        };

        if(this.extra) validationData.extra = this.extra;

        if(!this.parameters.encryption.disable)
            validationData.key = this.keys.publicKey

        let connData: string = JSON.stringify(parseOut(
            JSON.stringify(validationData),
            this.parameters.encryption,
            this.parameters.compression
        ));

        await this.connDriver.connect(connData);
    }

    /**  Disconnect from server. */
    async disconnect() {
        await this.connDriver.disconnect();
    }

    /**
     * Set a timeout for the next emit.
     * @param timeout Time in milliseconds.
     * @return self.
     */
    timeout(timeout: number): Client {
        this.flags.timeout = timeout;
        return this;
    }

    /**
     * Sets a volatile flag for the next emit.
     * If the socket is not ready to send messages, then the event message will be dropped.
     * @return self
     */
    get volatile(): Client {
        this.flags.volatile = true;
        return this;
    }

    /**
     * Send data to server under an event.
     * @param event The event where the data will be emitted.
     * @param data The data that will be sent.
     * @param callback A callback that will receive a response to this emit.
     *                  If failed to parse the response, an error will be returned
     * @throws Exception if error occurs
     */
    async emit(event: string, data: string, callback?: (data?: string, err?: any) => void) {
        let out = JSON.stringify(parseOut(data, this.parameters.encryption,
            this.parameters.compression));

        if(callback)
            await this.connDriver.emit(event, out, (data?: string, err?: any) => {
                if(err) return callback(data, err);
                data = data!!;

                try {
                    let parsedIn = parseIn(data, this.keys.privateKey);
                    callback(parsedIn.data);
                }
                catch (e) {
                    callback(data, e);
                }
            }, this.flags);
        else await this.connDriver.emit(event, out, undefined, this.flags);

        this.flags = {};
    }

    /**
     * Adds a listener that will be fired when any event is emitted.
     * @param event The event where the data will be emitted.
     * @param callback The listener that will be fired.
     *                  It carries:
     *                      the incoming data,
     *                      a callback for responding to this event,
     *                      and an error instance in case of failing to parse the incoming data.
     */
    on(event: string,
        callback: (
            data?: string,
            callback?: (data: string) => void,
            err?: any) => void
    ) {
        if(this.connDriver.reservedEvents.includes(event)){
            this.connDriver.on(event, callback)
            return;
        }

        this.connDriver.on(event, (data: string, cb?: (data: string) => void) => {
            let encCallback: ((data: string) => void) | undefined = undefined;

            if (cb)
                encCallback = (data) => cb(JSON.stringify(parseOut(data, this.parameters.encryption, this.parameters.compression)))

            try {
                let incoming = parseIn(data, this.keys.privateKey)
                callback(incoming.data, encCallback);
            }
            catch (e) {
                callback(data, encCallback, e);
            }
        });
    }

    /**
     * Removes all the listeners from the listener array for all or a specific event.
     * @param event
     */
    off(event?: string) {
        if(!event)
            this.connDriver.offAll();
        else this.connDriver.offEvent(event);
    }

    get connectionDriver(): SocketClient {
        return this.connDriver;
    }
}

