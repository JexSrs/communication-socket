import {CompressionParameters} from "../../parameters/CompressionParameters";

export abstract class Compress {
    constructor(readonly parameters: CompressionParameters) {}

    abstract compress(data: string): string;
    abstract decompress(data: string): string;
}