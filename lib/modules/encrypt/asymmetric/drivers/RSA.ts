import {Asymmetric} from "../Asymmetric";
import {EncryptionParameters} from "../../../../parameters/EncryptionParameters";
import {Buffer} from "buffer";
import {KeyPair} from "../../../../components/KeyPair";
import NodeRSA from "node-rsa";
// import crypto from "crypto";


export class RSA extends Asymmetric {
    static id: string = 'rsa'

    // private PADDING = crypto.constants.RSA_PKCS1_OAEP_PADDING;
    // private OAEP_HASH = "sha256";

    constructor(parameters: EncryptionParameters) {
        super(parameters);

        if(parameters.asymmetric!!.bits < 1024)
            throw new Error("encryption.asymmetric.bits cannot be lower than 1024.");
    }

    calculateSymmetricKeySize(): number {
        return this.parameters.asymmetric!!.bits / 8 - 66;
    }

    decrypt(key: string, cipher: string): string {
        const _key = new NodeRSA(key);
        return _key.decrypt(cipher, 'utf8');

        // const decryptedData = crypto.privateDecrypt(
        //     {
        //         key,
        //         padding: this.PADDING,
        //         oaepHash: this.OAEP_HASH
        //     },
        //     Buffer.from(cipher, "base64")
        // );
        //
        // // The decrypted data is of the Buffer type, which we can convert to a
        // // string to reveal the original data
        // return decryptedData.toString('utf-8')
    }

    encrypt(key: string, message: string): string {
        const _key = new NodeRSA(key);
        return _key.encrypt(Buffer.from(message, 'utf8'), 'base64');

        // const encryptedData = crypto.publicEncrypt(
        //     {
        //         key,
        //         padding: this.PADDING,
        //         oaepHash: this.OAEP_HASH
        //     },
        //     Buffer.from(message)
        // );
        //
        // return encryptedData.toString("base64")
    }

    generateKeys(): KeyPair {
        const _key = new NodeRSA({b: this.parameters.asymmetric!!.bits});
        return {
            publicKey: _key.exportKey('public'),
            privateKey: _key.exportKey('private'),
        };

        // return crypto.generateKeyPairSync("rsa", {
        //     modulusLength: this.parameters.asymmetric!!.bits,
        //     publicKeyEncoding: {
        //         type: 'spki',
        //         format: 'pem'
        //     },
        //     privateKeyEncoding: {
        //         type: 'pkcs8',
        //         format: 'pem'
        //     }
        // });
    }

    isKeyValid(key?: string): string {
        if(!key || key.length == 0)
            return 'Key cannot be empty';

        try {
            let message = '0'.repeat(this.calculateSymmetricKeySize());
            let result = this.encrypt(key, message);
        }
        catch (e: any) {
            if(e) return e?.message;
        }
        return '';
    }

}