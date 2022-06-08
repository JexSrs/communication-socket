import {ServerParameters} from "./parameters/event/ServerParameters";
import {isValid as isConDrVal, get as getConDriver} from "./modules/server";
import {idGen, isValidPort, parseIn} from "./modules/utils";
import {SocketServer} from "./modules/server/SocketServer";
import {Socket} from "./components/Socket";

export class Server {

    private declare connDriver: SocketServer
    private verifyFunction: ((client: Socket) => boolean | Promise<boolean>) = (client: Socket) => true

    constructor(
        readonly parameters: ServerParameters
    ) {
        if(typeof this.parameters.driver === 'undefined')
            this.parameters.driver = 'socket.io';

        if(!isConDrVal(parameters.driver)) throw new Error("connection.driver is invalid.");
        if(!isValidPort(parameters.port)) throw new Error('connection.port is not with range (0, 65535].')

        if(typeof this.parameters.refuseUnsignedId === 'undefined')
            this.parameters.refuseUnsignedId = false;

        if(typeof this.parameters.onFailedAuthentication === 'undefined')
            this.parameters.onFailedAuthentication = 'disconnect';

        this.connDriver = getConDriver(this.parameters);
    }

    /**
     * The server starts listening at the specified port.
     * @param callback
     */
    listen(callback: () => void) {
        this.connDriver.listen(callback);
    }

    /** Close the server. */
    close() {
        this.connDriver.close();
    }

    /**
     * On a socket connection after data are decrypted and id and extra has been set, this function will verify
     * if a socket is allowed to connect. Specifically this function was created to check for the connection token.
     * @param verify
     */
    setConnectVerification(verify: (socket: Socket) => boolean | Promise<boolean>) {
        this.verifyFunction = verify
    }

    /**
     * This function listens if a new socket has been connected.
     * The callback passes the socket instance and/or the error that may occur during connection (e.x. token validation failed).
     * If onFailedAuthentication is set to 'keep' the socket will not be disconnected for failing authentication.
     * @param callback
     */
    onConnection(callback: (socket: Socket, err?: any) => void) {
        this.connDriver.onConnection(async socket => {
            socket.decKey = this.parameters.key;

            // Decrypt & decompress data
            let decrypted: any
            try {
                let tmp = parseIn(socket.connectData, this.parameters.key);

                socket.parameters = tmp.headers;
                decrypted = JSON.parse(tmp.data!!);
            }
            catch (e) {
                if(this.parameters.onFailedAuthentication === 'disconnect')
                    socket.disconnect();
                return callback(socket, e);
            }

            // Check id
            if(typeof decrypted.id !== 'string' || decrypted.id.length == 0) {
                if(this.parameters.refuseUnsignedId) {
                    if(this.parameters.onFailedAuthentication === 'disconnect')
                        socket.disconnect();

                    return callback(socket, new Error('Did not get id from socket'));
                }

                socket.id = idGen(16);
            }
            else socket.id = decrypted.id;

            socket.extra = decrypted.extra;
            socket.auth = {
                key: decrypted.key,
                token: decrypted.token
            }

            // Token authentication
            let authedToken = await this.verifyFunction(socket)
            if (!authedToken) {
                if(this.parameters.onFailedAuthentication === 'disconnect')
                    socket.disconnect();
                return callback(socket, new Error('Failed token authentication'))
            }

            callback(socket);
        });
    }
}
