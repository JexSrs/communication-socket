## Write your own

In case none of the above encryption drivers fulfills your needs, there is nothing to worry about.
Just follow the steps we have prepared, so you can write your own encryption driver.

1) First download the repository.

```shell
git clone https://github.com/JexSrs/communication-socket.git
```

2) Open the project using your favorite editor or IDE and navigate at:
* `lib/modules/compress/drivers`

3) There you will create your own driver file.

4) After that you have to create a class that inherits the `abstract class` in the above directory.

```typescript
import {Compress} from "../Compress";
import {CompressionParameters} from "../../../../parameters/CompressionParameters"; // Compression parameters, will be used for configuration.

export class CompDriver extends Compress {
    constructor(parameters: CompressionParameters) {
        super(parameters);
    }

   compress(data: string): string {
        // ...
   }
   
   decompress(data: string): string {
        // ...
   }
}
```

5) After that you have to fill the functions with your code.

6) Add an id for identifying your driver

```typescript
// ...

export class CompDriver extends Compress {
   static id: string = 'comp-driver'
   // ...
}
```

7) Then navigate at the loader file in the above directory and register your driver.
```typescript
import {CompDriver} from "./drivers/compDriver";

export const drivers: { [key: string]: any } = {
    [CompDriver.id]: CompDriver
};

```

That's it. Now you can start using your custom driver.
