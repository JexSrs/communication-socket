import {Symmetric} from "./Symmetric";
import {EncryptionParameters} from "../../../parameters/EncryptionParameters";
import {AES_128_GCM} from "./drivers/AES_128_GCM";

export const drivers: { [key: string]: any } = {
    [AES_128_GCM.id]: AES_128_GCM
};

export function isValid(driver?: string): boolean {
    if(!driver) return false;
    return Object.keys(drivers).includes(driver);
}

export function get(parameters: EncryptionParameters): Symmetric | null {
    if(!parameters.symmetric) return null;
    if(!isValid(parameters.symmetric.driver)) return null;

    return new drivers[parameters.symmetric.driver](parameters);
}