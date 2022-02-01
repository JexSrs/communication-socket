export interface EncryptionParameters {
    disable: boolean,
    asymmetric?: {
        driver: string,
        bits: number,
        key: string
    },
    symmetric?: {
        driver: string
    }
}