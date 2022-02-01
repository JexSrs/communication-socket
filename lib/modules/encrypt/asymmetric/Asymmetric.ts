import {EncryptionParameters} from "../../../parameters/EncryptionParameters";
import {KeyPair} from "../../../components/KeyPair";

export abstract class Asymmetric {
    protected constructor(readonly parameters: EncryptionParameters) {}

    abstract encrypt(key: string, message: string): string;
    abstract decrypt(key: string, cipher: string): string;
    abstract generateKeys(): KeyPair;
    abstract calculateSymmetricKeySize(): number;
    abstract isKeyValid(key?: string): string;
}