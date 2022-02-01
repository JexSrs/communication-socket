import {EncryptionParameters} from "../EncryptionParameters";
import {CompressionParameters} from "../CompressionParameters";
import {ConnectionClientParameters} from "./ConnectionClientParameters";

export interface ClientParameters {
    connection: ConnectionClientParameters,
    encryption: EncryptionParameters,
    compression: CompressionParameters,
}