## Write your own

In case none of the above encryption drivers fulfills your needs, there is nothing to worry about.
Just follow the steps we have prepared, so you can write your own encryption driver.

1) First download the repository.

```shell
git clone https://github.com/JexSrs/communication-socket.git
```

2) Open the project using your favorite editor or IDE and navigate at:
* `lib/modules/encrypt/asymmetric/drivers` (or `/symmetric/` for symmetric encryption)

3) There you will create your own driver file.

4) After that you have to create a class that inherits the `abstract class` in the above directory (Asymmetric or Symmetric).
The example below is taking the `Asymmetric` driver as an example

```typescript
import {Asymmetric} from "../Asymmetric";
import {EncryptionParameters} from "../../../../parameters/EncryptionParameters"; // Encryption parameters, will be used for configuration.
import {KeyPair} from "../../../../components/KeyPair"; // Type for returning generated keys.

export class RSA extends Asymmetric {
    constructor(parameters: EncryptionParameters) {
        super(parameters);
    }

    // How much space is available for the encrypted string, padding, bits etc.
    calculateSymmetricKeySize(): number {
        // ...
    }

    decrypt(key: string, cipher: string): string {
        // ...
    }

    encrypt(key: string, message: string): string {
        // ...
    }

    generateKeys(): KeyPair {
        // ...
    }

   // Checks if the given public key is valid
   isKeyValid(key?: string): string {
        // ...
   }
}
```

5) After that you have to fill the functions with your code.

```typescript
// ...
import crypto from "crypto";
import {Buffer} from "buffer";

export class RSA extends Asymmetric {
   calculateSymmetricKeySize(): number {
      return this.parameters.asymmetric!!.bits / 8 - 66;
   }

   decrypt(key: string, cipher: string): string {
      const decryptedData = crypto.privateDecrypt({
           key,
           padding: this.PADDING,
           oaepHash: this.OAEP_HASH
        }, Buffer.from(cipher, "base64"));
      
      // Make sure to always return string type
      return decryptedData.toString('utf-8')
   }

   encrypt(key: string, message: string): string {
     const encryptedData = crypto.publicEncrypt({
           key,
           padding: this.PADDING,
           oaepHash: this.OAEP_HASH
        }, Buffer.from(message));

      // Make sure to always return string type
      return encryptedData.toString("base64")
   }

   generateKeys(): KeyPair {
      return crypto.generateKeyPairSync("rsa", {
         modulusLength: this.parameters.asymmetric!!.bits,
         publicKeyEncoding: {type: 'spki', format: 'pem'},
         privateKeyEncoding: {type: 'pkcs8', format: 'pem'}
      });
   }
   
   isKeyValid(key?: string): string {
      // Return the error message.
      if(!key || key.length == 0)
          return 'Key cannot be empty';

      try {
         let message = '0'.repeat(this.calculateSymmetricKeySize());
         let result = this.encrypt(key, message);
      }
      catch (e: any) {
         if(e) return e?.message;
      }
      
      // Return empty string if key is valid.
      return '';
   }
}
```

6) Add an id for identifying your driver

```typescript
// ...

export class RSA extends Asymmetric {
   static id: string = 'rsa'
   // ...
}
```

7) Then navigate at the loader file in the above directory and register your driver.
```typescript
import {RSA} from "./drivers/rsa";

export const drivers: { [key: string]: any } = {
    [RSA.id]: RSA
};

```

That's it. Now you can start using your custom driver.