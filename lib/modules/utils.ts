import {EncryptionParameters} from "../parameters/EncryptionParameters";
import {CompressionParameters} from "../parameters/CompressionParameters";
import {get as getAsymDriver} from "./encrypt/asymmetric";
import {get as getSymDriver} from "./encrypt/symmetric";
import {get as getComDriver} from "./compress";
import {customAlphabet} from "nanoid";
import {Result} from "../components/Result";

function toHeaders(encParams: EncryptionParameters, compParams: CompressionParameters): { encryption: EncryptionParameters, compression: CompressionParameters } {
    let enc = JSON.parse(JSON.stringify(encParams));
    let comp = JSON.parse(JSON.stringify(compParams));

    if(!enc.disable)
        delete enc.asymmetric?.key;

    return {
        encryption: enc,
        compression: comp
    };
}

function validateHeaders(headers: any): boolean {
    if(!headers) return false;
    if(!headers.encryption) return false;
    if(!headers.encryption.disable) {
        if(!headers.encryption.asymmetric) return false;
        if(!headers.encryption.asymmetric.driver) return false;
        if(!headers.encryption.asymmetric.bits) return false;

        if(!headers.encryption.symmetric) return false;
        if(!headers.encryption.symmetric.driver) return false;
    }

    if(!headers.compression) return false;
    if(!headers.compression.disable) {
        if (!headers.compression.driver) return false;
    }

    return true;
}

export function parseOut(data: string | undefined, encParams: EncryptionParameters, compParams: CompressionParameters): Result {
    let p: string | undefined = data;

    if(!p) return {headers: toHeaders(encParams, compParams)};

    // Encrypt
    if(!encParams.disable) {
        const asymDriver = getAsymDriver(encParams)!!;
        const symDriver = getSymDriver(encParams)!!;

        // Generate key
        const symKey: string = symDriver.generateKey(asymDriver.calculateSymmetricKeySize());

        // Encrypt data & key
        const data_enc: string = symDriver.encrypt(symKey, p);
        const key_enc: string = asymDriver.encrypt(encParams.asymmetric!!.key, symKey);

        p = JSON.stringify({data_enc, key_enc});
    }

    // Compress
    if(!compParams.disable) {
        p = getComDriver(compParams)!!.compress(p);
        p = JSON.stringify({compressed: p});
    }

    return {
        data: p,
        headers: toHeaders(encParams, compParams)
    };
}

export function parseIn(data: any, privateKey: string): Result {
    if(!data) throw new Error('No data has been passed');
    if(typeof data !== 'string') throw new Error('Data is not type string');
    let tmp = JSON.parse(data);
    if(Object.keys(tmp).length == 0) throw new Error('No data has been passed');

    let headers = tmp.headers, p = tmp.data;

    if(!validateHeaders(headers)) throw new Error("Invalid headers.");
    if(!p) return {headers};

    // Decompress
    if(!headers.compression.disable) {
        let driver = getComDriver(headers.compression);
        if(!driver) throw new Error(`Invalid compression driver '${headers.compression.driver}'`);

        p = driver.decompress(p);
    }

    // Decrypt
    if(!headers.encryption.disable) {
        let asymDriver = getAsymDriver(headers.encryption);
        if(!asymDriver) throw new Error(`Invalid encryption.asymmetric driver '${headers.encryption.asymmetric.driver}'`);
        let symDriver = getSymDriver(headers.encryption);
        if(!symDriver) throw new Error(`Invalid encryption.symmetric driver '${headers.encryption.symmetric.driver}'`);

        let {data_enc, key_enc} = JSON.parse(p);
        let symKey = asymDriver.decrypt(privateKey, key_enc);
        p = symDriver.decrypt(symKey, data_enc);
    }

    return {data: p, headers};
}

export function isValidPort(port: any): boolean {
    let portInt = parseInt(port, 10);
    if (isNaN(portInt)) return false;

    return portInt > 0 && portInt <= 65535;
}

export function idGen(length: number): string {
    return customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", length)()
}