import {Symmetric} from "../Symmetric";
import {customAlphabet} from "nanoid";
import * as CryptoJS from "crypto-js";
// import crypto from "crypto";

export class AES_128_GCM extends Symmetric {

    static id: string = 'aes-128-gcm'

    // ALGORITHM_NAME = "aes-128-gcm";
    // ALGORITHM_NONCE_SIZE = 12;
    // ALGORITHM_TAG_SIZE = 16;
    // ALGORITHM_KEY_SIZE = 16;
    // PBKDF2_NAME = "sha256";
    // PBKDF2_SALT_SIZE = 16;
    // PBKDF2_ITERATIONS = 32767;
    //
    // private _encrypt(plaintext: Buffer, key: string) {
    //     // Generate a 96-bit nonce using a CSPRNG.
    //     let nonce = crypto.randomBytes(this.ALGORITHM_NONCE_SIZE);
    //
    //     // Create the cipher instance.
    //     let cipher = crypto.createCipheriv(this.ALGORITHM_NAME, key, nonce);
    //
    //     // Encrypt and prepend nonce.
    //     let ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    //
    //     return Buffer.concat([nonce, ciphertext, cipher.getAuthTag()]);
    // }
    //
    // private _decrypt(ciphertextAndNonce: Buffer, key: string) {
    //     // Create buffers of nonce, ciphertext and tag.
    //     let nonce = ciphertextAndNonce.slice(0, this.ALGORITHM_NONCE_SIZE);
    //     let ciphertext = ciphertextAndNonce.slice(this.ALGORITHM_NONCE_SIZE, ciphertextAndNonce.length - this.ALGORITHM_TAG_SIZE);
    //     let tag = ciphertextAndNonce.slice(ciphertext.length + this.ALGORITHM_NONCE_SIZE);
    //
    //     // Create the cipher instance.
    //     let cipher = crypto.createDecipheriv(this.ALGORITHM_NAME, key, nonce);
    //
    //     // Decrypt and return result.
    //     cipher.setAuthTag(tag);
    //     return Buffer.concat([cipher.update(ciphertext), cipher.final()]);
    // }

    decrypt(key: string, cipher: string): string {
        let bytes = CryptoJS.AES.decrypt(cipher, key);
        return bytes.toString(CryptoJS.enc.Utf8);

        // // Decode the base64.
        // let ciphertextAndNonceAndSalt = Buffer.from(cipher, "base64");
        //
        // // Create buffers of salt and ciphertextAndNonce.
        // let salt = ciphertextAndNonceAndSalt.slice(0, this.PBKDF2_SALT_SIZE);
        // let ciphertextAndNonce = ciphertextAndNonceAndSalt.slice(this.PBKDF2_SALT_SIZE);
        //
        // // Derive the key using PBKDF2.
        // let _key = crypto.pbkdf2Sync(Buffer.from(key, "utf8"), salt, this.PBKDF2_ITERATIONS, this.ALGORITHM_KEY_SIZE, this.PBKDF2_NAME);
        //
        // // Decrypt and return result.
        // return this._decrypt(ciphertextAndNonce, _key).toString("utf8");
    }

    encrypt(key: string, message: string): string {
        return CryptoJS.AES.encrypt(message, key).toString();

        // // Generate a 128-bit salt using a CSPRNG.
        // let salt = crypto.randomBytes(this.PBKDF2_SALT_SIZE);
        //
        // // Derive a key using PBKDF2.
        // let _key = crypto.pbkdf2Sync(Buffer.from(key, "utf8"), salt, this.PBKDF2_ITERATIONS, this.ALGORITHM_KEY_SIZE, this.PBKDF2_NAME);
        //
        // // Encrypt and prepend salt.
        // let buffer = Buffer.from(message, "utf8")
        // let ciphertextAndNonceAndSalt = Buffer.concat([salt, this._encrypt(buffer, _key)]);
        //
        // // Return as base64 string.
        // return ciphertextAndNonceAndSalt.toString("base64");
    }

    generateKey(length: number): string {
        return customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', length)()
    }
}