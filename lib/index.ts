import {drivers as compDrivers} from "./modules/compress";
import {drivers as sockClientDrivers} from "./modules/client";
import {drivers as sockServerDrivers} from "./modules/server";
import {drivers as asymmetricDrivers} from "./modules/encrypt/asymmetric";
import {drivers as symmetricDrivers} from "./modules/encrypt/symmetric";

export {Socket} from "./components/Socket";
export {Client} from "./Client";
export {Server} from "./Server";

export class SupportedDrivers {
    static compression(): string[] {
        return Object.keys(compDrivers);
    }

    static socketClient(): string[] {
        return Object.keys(sockClientDrivers);
    }

    static socketServer(): string[] {
        return Object.keys(sockServerDrivers);
    }

    static asymmetricEncryption(): string[] {
        return Object.keys(asymmetricDrivers);
    }

    static symmetricEncryption(): string[] {
        return Object.keys(symmetricDrivers);
    }
}
