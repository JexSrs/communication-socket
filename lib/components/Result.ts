import {EncryptionParameters} from "../parameters/EncryptionParameters";
import {CompressionParameters} from "../parameters/CompressionParameters";

export interface Result {
    data?: string,
    headers: {
        encryption: EncryptionParameters,
        compression: CompressionParameters
    }
}