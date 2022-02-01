import {RSA} from "./drivers/RSA";
import {Asymmetric} from "./Asymmetric";
import {EncryptionParameters} from "../../../parameters/EncryptionParameters";

export const drivers: { [key: string]: any } = {
    [RSA.id]: RSA
};

export function isValid(driver?: string): boolean {
    if(!driver) return false;
    return Object.keys(drivers).includes(driver);
}

export function get(parameters: EncryptionParameters): Asymmetric | null {
    if(!parameters.asymmetric) return null;
    if(!isValid(parameters.asymmetric.driver)) return null;

    return new drivers[parameters.asymmetric.driver](parameters);
}