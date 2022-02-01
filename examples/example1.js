const {Client, Server} = require("../dist");
const {expect} = require("chai");

const CONNECTION_DRIVER = 'socket.io';
const TOKEN = '12345';
const ASYMMETRIC_PUBLIC_KEY = '-----BEGIN PUBLIC KEY-----\n' +
    'MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHyHWeEvjj+DYY6lWgnTaGAC63rj\n' +
    'rsrl+JKLIG8F5VqIHM8s6VOYWvPHvrFp+W0mcxwMk3msn0k+cq6n94BcTWdPk7DN\n' +
    'cQLfCkUECjz5T2XH/j39sFvHmO6tual6rxemf/kyQVRdVf+Vso6AI7wNhcUPCS19\n' +
    'QDUpuybt0ZvJXKrvAgMBAAE=\n' +
    '-----END PUBLIC KEY-----';
const ASYMMETRIC_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIICXAIBAAKBgHyHWeEvjj+DYY6lWgnTaGAC63rjrsrl+JKLIG8F5VqIHM8s6VOY\n' +
    'WvPHvrFp+W0mcxwMk3msn0k+cq6n94BcTWdPk7DNcQLfCkUECjz5T2XH/j39sFvH\n' +
    'mO6tual6rxemf/kyQVRdVf+Vso6AI7wNhcUPCS19QDUpuybt0ZvJXKrvAgMBAAEC\n' +
    'gYBZy9g6E2rFzd1ZWU7V6wZGxZQ8Z1YxpSdbtMtMg7nhUGlF06LkzuY3CAAwOrTL\n' +
    'yoAS59aoVJv/2vIjk6dbfjOplqk0n783yGXv9vwlgZkc9deUTxRYXodhHi5yJXUb\n' +
    'nU+olXg3rtaj1So7XSfcfvY1jjavAjE/ZiFdHnQvqNB1gQJBANuJo2qKP2v/aZhO\n' +
    'rR++NWLEWl1J2i0TTj/RaQOYgcCIsc++7esvxwoZAsaFv9MauNbpTT4OmzaMZhNV\n' +
    'H4o9Rw8CQQCRNhjScJZRAMeGO30kBBqR/WmC6AVG7VVA6ldN2L/QNwRFoc1Xxvlq\n' +
    'cmu8MymY3czZGND6D0fwVwcleSBKsV4hAkEAwCEdxiDFTnPR6vx34L7rI8vptZjr\n' +
    'euVZZtqTCBWRAHng+4oB2AERNVIcLrdg4JSTTWoSMow/5CZNMwAdQTNNmwJANGdk\n' +
    'b9VnudXhK4UedTfx6sucHzziYqVVxfaMCTD2kAq6xPJOa6YH7q1aSfHgyiUJPzOg\n' +
    'fw2ytX6CurhKugnmYQJBAJz8H/rIOO3mEzhJC7ZBEksegg5+NugcmLGb/f/PZwc8\n' +
    'CkbWKJMXsuiRizlewpbXqfBPtn/gTrmiUCuNufviztw=\n' +
    '-----END RSA PRIVATE KEY-----';


let server = new Server({
    port: 5000,
    onFailedAuthentication: 'disconnect',
    refuseUnsignedId: true,
    driver: CONNECTION_DRIVER,
    key: ASYMMETRIC_PRIVATE_KEY
});


// Set token verification function
server.setConnectVerification(socket => {
    console.log(socket.id, socket.address, socket.extra);
    return socket.auth.token === TOKEN;
});

server.onConnection((socket, err) => {
    if(err) {
        // The error may occur during decryption (invalid key), so the id property will not be set.
        console.log(`Error during connection for socket with address: ${socket.address}`, err);
        return;
    }

    console.log(`Connected client: ${socket.id} with extra data:`, socket.extra);

    socket.on('myEvent', (data, callback, err1) => {
        if(err1) {
            console.log(err1);
            return;
        }

        console.log(data);

        // The client may not provide callback in this event.
        if(callback) {
            callback('Accepted!');
        }
    })
});

server.listen(() => {
    console.log(`Server listening at port :5000.`)
});

let client = new Client({
    connection: {
        driver: CONNECTION_DRIVER,
        address: 'http://localhost:5000',
        token: TOKEN
    },
    encryption: {
        disable: false,
        asymmetric: {
            driver: 'rsa',
            bits: 2048,
            key: ASYMMETRIC_PUBLIC_KEY
        },
        symmetric: {
            driver: 'aes-128-gcm'
        }
    },
    compression: {
        disable: true,
        driver: ''
    }
});

client.on('connect', () => {
    client.timeout(2000).emit('myEvent', 'Hello, dino', (data, err) => {
        if(err)
            console.log(err);
        else
            console.log(data);
    });
})

client.setExtra(JSON.stringify({hello: 'world!'}));
client.connect('dino');