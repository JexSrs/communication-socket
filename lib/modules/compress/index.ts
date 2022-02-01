import {Compress} from "./Compress";
import {CompressionParameters} from "../../parameters/CompressionParameters";

export const drivers: { [key: string]: any } = {

};

export function isValid(driver?: string): boolean {
    if(!driver) return false;
    return Object.keys(drivers).includes(driver);
}

export function get(parameters: CompressionParameters): Compress | null {
    if(!isValid(parameters.driver)) return null;
    return new drivers[parameters.driver!!](parameters);
}