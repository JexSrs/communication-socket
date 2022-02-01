import {EncryptionParameters} from "../../../parameters/EncryptionParameters";

export abstract class Symmetric {
    constructor(readonly parameters: EncryptionParameters) {}

    abstract encrypt(key: string, message: string): string;
    abstract decrypt(key: string, cipher: string): string;
    abstract generateKey(length: number): string;
}