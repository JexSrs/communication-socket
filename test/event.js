const expect = require('chai').expect;

const {Client, Server} = require("../dist");

const CONNECTION_DRIVER = 'socket.io';
const CLIENT_ADDRESS = 'http://localhost:5000';
const TOKEN = '12345';
const ASYMMETRIC_DRIVER = 'rsa';
const SYMMETRIC_DRIVER = 'aes-128-gcm';
const ASYMMETRIC_BITS = 1024;
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
const CLIENT_EXTRA = 'testExtra String'
const CLIENT_ID = 'client-id';


let server = new Server({
    port: 5000,
    onFailedAuthentication: 'disconnect',
    refuseUnsignedId: true,
    driver: CONNECTION_DRIVER,
    key: ASYMMETRIC_PRIVATE_KEY
});

let client = new Client({
    connection: {
        driver: CONNECTION_DRIVER,
        address: CLIENT_ADDRESS,
        token: TOKEN
    },
    encryption: {
        disable: false,
        asymmetric: {
            driver: ASYMMETRIC_DRIVER,
            bits: ASYMMETRIC_BITS,
            key: ASYMMETRIC_PUBLIC_KEY
        },
        symmetric: {
            driver: SYMMETRIC_DRIVER
        }
    },
    compression: {
        disable: true,
        driver: ''
    }
});

server.setConnectVerification(socket => {
    return socket.auth.token === TOKEN;
});

describe('Socket Connection', function () {
    describe('Server', function () {
        it('Error checking', function () {
            server.onConnection((socket, err) => {
                expect(err).to.undefined;
            });
        });

        it('Socket ID checking', function () {
            server.onConnection((socket, err) => {
                expect(socket.id).to.equal(CLIENT_ID);
            });
        });

        it('Socket Extra checking', function () {
            server.onConnection((socket, err) => {
                expect(socket.extra).to.equal(CLIENT_EXTRA);
            });
        });
    });

    describe('Client', function () {
        it('No connect error', function () {
            client.on('connect_error', (reason) => {
                expect(reason).to.undefined;
            })
        });
    });
});

describe('Emits', function () {
    describe('From client', function () {
        it('Simple emit', function () {
            client.on('connect', () => {
                client.timeout(2000).emit('event', 'test');
            });
        });

        it('Emit with ack', function () {
            client.on('connect', () => {
                client.timeout(2000).emit('eventAck', 'test', (data, err) => {
                    expect(err).to.undefined;
                    expect(data).to.equal('test-response');
                });
            });
        });
    });

    describe('From server', function () {
        it('Simple emit', function () {
            server.onConnection((socket, err) => {
                socket.timeout(2000).emit('event', 'test');
            });
        });

        it('Emit with ack', function () {
            server.onConnection((socket, err) => {
                socket.timeout(2000).emit('eventAck', 'test', (data, err) => {
                    expect(err).to.undefined;
                    expect(data).to.equal('test-response');
                });
            });
        });
    });

});

describe('Listeners', function () {
    describe('Server', function () {
        it('Simple emit', function () {
            server.onConnection((socket, err) => {
                socket.on('event', (data, callback, err1) => {
                    expect(err1).to.undefined;
                    expect(callback).to.undefined;
                    expect(data).to.equal('test');
                });
            });
        });

        it('Emit with ack', function () {
            server.onConnection((socket, err) => {
                socket.on('eventAck', (data, callback, err1) => {
                    expect(err1).to.undefined;
                    expect(data).to.equal('test');
                    callback('test-response');
                });
            });
        });
    });

    describe('Client', function () {
        it('Simple emit', function () {
            client.on('event', (data, callback, err) => {
                expect(err).to.undefined;
                expect(callback).to.undefined;
                expect(data).to.equal('test');
            });
        });

        it('Emit with ack', function () {
            client.on('eventAck', (data, callback, err) => {
                expect(err).to.undefined;
                expect(data).to.equal('test');
                callback('test-response');

            });
        });
    });

});

server.listen(() => {
    client.setExtra(CLIENT_EXTRA);
    client.connect(CLIENT_ID);

    setTimeout(() => {
        client.disconnect();
        server.close();
        process.exit(0);
    }, 10 * 1000);
});