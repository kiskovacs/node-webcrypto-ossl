var assert = require('assert');
var crypto = require('crypto');

var webcrypto = require('./config');

var ecdsa_pkey_json_256 = '{"crv":"P-256","d":"yc_pdEqHhjMAk8w3Yq0yVmnlKYV1jBBo6ThVc5iJSqU","ext":true,"key_ops":["sign"],"kty":"EC","x":"e8iiCqQRobJkDVodjY8h6xxz812IU5wQD8OKthVjkxk","y":"3HHkboj5WFUjf-3P-UtxzIDnj71cfppEE0X-lDtIYXM"}';
var ecdsa_pubkey_json_256 = '{"crv":"P-256","ext":true,"key_ops":["verify"],"kty":"EC","x":"e8iiCqQRobJkDVodjY8h6xxz812IU5wQD8OKthVjkxk","y":"3HHkboj5WFUjf-3P-UtxzIDnj71cfppEE0X-lDtIYXM"}';
var ecdsa_signature_sha256 = "2hWEkyEDu1L8oM5Ty2hrz5fce1k3x7zbkBpTawW6sMZb4hhTmlT3GjMqWDs3i1zyE1b/miQMEoVhtc5+U7NTvA==";
//"MEUCIFoUVs/MlxKIge49fAsF3L/FJCyYJNc/Kqr/WnPZ2n7tAiEA0zNTXGFPRGVxBiNo+xWgjM6N/hMccnT+SmTBf8azhhQ="

var ecdsa_pkey_json_384 = '{"crv":"P-384","d":"zWcBN2j49GfQioUrq1Im0Wph_UXExXPmsEUuY2oW-5EEaQAkL6L3HsBiWD6qwrRC","ext":true,"key_ops":["sign"],"kty":"EC","x":"lICjaouipTzjecKGqGtGsk7P7f5MkLWGmFl5MstedIkCttr9ow3fq77Dbb4aEWzS","y":"1dU_-FMuvl97crcufR11_p8BVu7LvcmjyO65gwDvSXGUtflwR101iOLMhvL2W490"}';
var ecdsa_pubkey_json_384 = '{"crv":"P-384","ext":true,"key_ops":["verify"],"kty":"EC","x":"lICjaouipTzjecKGqGtGsk7P7f5MkLWGmFl5MstedIkCttr9ow3fq77Dbb4aEWzS","y":"1dU_-FMuvl97crcufR11_p8BVu7LvcmjyO65gwDvSXGUtflwR101iOLMhvL2W490"}';
var ecdsa_signature_384_sha256 = "d4DC1hqV0FstrRDv30v/MorVEGgwXufDeFJtP5la5ZWDJdLtIwrV/FHJLHS0VaKA/pSrcACnbywN787BfJcTIwtcZ2WKcQuITeNTLMuip/zxf4Rek/HzVT9qwE0Xef0k";

function testDeriveKey(webcrypto, namedCurve, algName, keySize, done) {
    var promise = new Promise(function (resolve, reject) {
        var key = null;
        webcrypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: namedCurve, //can be "P-256", "P-384", or "P-521"
            },
            false, //whether the key is extractable (i.e. can be used in exportKey)
            ["deriveKey"] //can be any combination of "deriveKey"
            )
            .then(function (k) {
                assert.equal(k.privateKey !== null, true, "Has no private key");
                assert.equal(k.publicKey !== null, true, "Has no public key");
                key = k;
                return webcrypto.subtle.deriveKey(
                    {
                        name: "ECDH",
                        namedCurve: namedCurve, //can be "P-256", "P-384", or "P-521"
                        public: k.publicKey, //an ECDH public key from generateKey or importKey
                    },
                    k.privateKey, //your ECDH private key from generateKey or importKey
                    { //the key type you want to create based on the derived bits
                        name: algName, //can be any AES algorithm ("AES-CTR", "AES-CBC", "AES-CMAC", "AES-GCM", "AES-CFB", "AES-KW", "ECDH", "DH", or "HMAC")
                        //the generateKey parameters for that type of algorithm
                        length: keySize, //can be  128, 192, or 256
                    },
                    false, //whether the derived key is extractable (i.e. can be used in exportKey)
                    ["encrypt", "decrypt"] //limited to the options in that algorithm's importKey
                    )
            })
            .then(function (key) {
                assert.equal(key != null, true, "Has no derived Key value");
                assert.equal(key.type === "secret", true, "Derived key is not Secret");
            })
            .then(resolve, reject);
    })
    promise = promise.then(done, done);
}

describe("WebCrypto ECDSA sign/verify", function () {
    
    before(function (done) {
        done();
    })

    var TEST_MESSAGE = new Buffer("This is test message for crypto functions");

    it("Ecdsa", function (done) {

        var key = null;
        webcrypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256", 	//can be "P-256", "P-384", or "P-521"
            },
            false, 						//whether the key is extractable (i.e. can be used in exportKey)
            ["sign", "verify"] 			//can be any combination of "sign" and "verify"
            )
            .then(function (k) {
                assert.equal(k.privateKey !== null, true, "Has no private key");
                assert.equal(k.publicKey !== null, true, "Has no public key");
                key = k;
                return webcrypto.subtle.sign(
                    {
                        name: "ECDSA",
                        hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                    },
                    key.privateKey,
                    TEST_MESSAGE)
            })
            .then(function (sig) {
                assert.equal(sig !== null, true, "Has no signature value");
                assert.notEqual(sig.length, 0, "Has empty signature value");
                return webcrypto.subtle.verify(
                    {
                        name: "ECDSA",
                        hash: { name: "SHA-256" }, //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                    },
                    key.publicKey,
                    sig,
                    TEST_MESSAGE
                    )
            })
            .then(function (v) {
                assert.equal(v, true, "Ecdsa signature is not valid");
            })
            .then(done, done);
    })

    it("Ecdsa export/import PKCS8", function (done) {

        var key = null;
        webcrypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256", 	//can be "P-256", "P-384", or "P-521"
            },
            false, 						//whether the key is extractable (i.e. can be used in exportKey)
            ["sign", "verify"] 			//can be any combination of "sign" and "verify"
            )
            .then(function (k) {
                key = k;
                return webcrypto.subtle.exportKey(
                    "pkcs8",
                    key.privateKey
                    );
            })
            .then(function (pkcs8) {
                assert.equal(pkcs8 instanceof ArrayBuffer, true, "pkcs8 is not ArrayBuffer");
                return webcrypto.subtle.importKey(
                    "pkcs8",
                    pkcs8,
                    {
                        name: "ECDSA",
                        namedCurve: "P-256", 	//can be "P-256", "P-384", or "P-521"
                    },
                    false, 						//whether the key is extractable (i.e. can be used in exportKey)
                    ["sign", "verify"] 			//can be any combination of "sign" and "verify"
                    )
            })
            .then(function (k) {
                assert.equal(k.type === "private", true, "Key is not Private");
                assert.equal(k.algorithm.name === "ECDSA", true, "Key is not ECDSA");
            })
            .then(done, done);
    })

    it("Ecdsa export/import SPKI", function (done) {

        var key = null;
        webcrypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256", 	//can be "P-256", "P-384", or "P-521"
            },
            false, 						//whether the key is extractable (i.e. can be used in exportKey)
            ["sign", "verify"] 			//can be any combination of "sign" and "verify"
            )
            .then(function (k) {
                key = k;
                return webcrypto.subtle.exportKey(
                    "spki",
                    key.publicKey
                    );
            })
            .then(function (spki) {
                assert.equal(spki instanceof ArrayBuffer, true, "spki is not ArrayBuffer");
                return webcrypto.subtle.importKey(
                    "spki",
                    spki,
                    {
                        name: "ECDSA",
                        namedCurve: "P-256",
                    },
                    false,
                    ["verify"]
                    )
            })
            .then(function (k) {
                assert.equal(k.type === "public", true, "Key is not Public");
                assert.equal(k.algorithm.name === "ECDSA", true, "Key is not ECDSA");
            })
            .then(done, done);
    })

    it("Ecdsa JWK export/import", function (done) {
        var _jwk;
        var key = null;
        webcrypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256", 	//can be "P-256", "P-384", or "P-521"
            },
            false, 						//whether the key is extractable (i.e. can be used in exportKey)
            ["sign", "verify"] 			//can be any combination of "sign" and "verify"
            )
            .then(function (k) {
                assert.equal(k.privateKey !== null, true, "Has no private key");
                assert.equal(k.publicKey !== null, true, "Has no public key");
                key = k;
                return webcrypto.subtle.exportKey(
                    "jwk",
                    key.privateKey
                    );
            })
            .then(function (jwk) {
                assert.equal(jwk.x !== null, true, "Wrong EC key param");
                assert.equal(jwk.y !== null, true, "Wrong EC key param");
                assert.equal(jwk.d !== null, true, "Wrong EC key param");
                assert.equal(jwk.crv !== null, true, "Wrong EC key param");
                _jwk = jwk;
                return webcrypto.subtle.importKey(
                    "jwk",
                    jwk,
                    {
                        name: "ECDSA",
                        namedCurve: "P-256"
                    },
                    false,
                    ["sign"]
                    );
            })
            .then(function (k) {
                assert.equal(k.type === "private", true, "Key is not Private");
                assert.equal(k.algorithm.name === "ECDSA", true, "Key is not ECDSA");
                return webcrypto.subtle.exportKey("jwk", k)
            })
            .then(function (jwk) {
                assert.equal(jwk.x === _jwk.x, true, "Wrong EC key param");
                assert.equal(jwk.y === _jwk.y, true, "Wrong EC key param");
                assert.equal(jwk.d === _jwk.d, true, "Wrong EC key param");
                return webcrypto.subtle.sign(
                    {
                        name: "ECDSA",
                        hash: { name: "SHA-256" } //can be "SHA-1", "SHA-256", "SHA-384", or "SHA-512"
                    },
                    key.privateKey,
                    TEST_MESSAGE)
            })
            .then(function (sig) {
                assert.equal(sig !== null, true, "Has no signature value");
                assert.notEqual(sig.length, 0, "Has empty signature value");
                return webcrypto.subtle.verify(
                    {
                        name: "ECDSA",
                        hash: { name: "SHA-256" }
                    },
                    key.publicKey, //from generateKey or importKey above
                    sig, //ArrayBuffer of the signature
                    TEST_MESSAGE  //ArrayBuffer of the data
                    )
            })
            .then(function (v) {
                assert.equal(v, true, "Signature is not valid")
            })
            .then(done, done);
    })

    it("Ecdh derive AES-CBC 128", function (done) {
        testDeriveKey(webcrypto, "P-256", "AES-CBC", 128, done)
    })

    it("Ecdh derive AES-CBC 256", function (done) {
        testDeriveKey(webcrypto, "P-256", "AES-CBC", 256, done)
    })

    it("Ecdh derive AES-GCM 128", function (done) {
        testDeriveKey(webcrypto, "P-256", "AES-GCM", 128, done)
    })

    it("Ecdh derive AES-GCM 256", function (done) {
        testDeriveKey(webcrypto, "P-256", "AES-GCM", 256, done)
    })

    it("Ecdh export/import PKCS8", function (done) {

        var key = null;
        webcrypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-256",
            },
            false,
            ["decrypt", "encrypt"]
            )
            .then(function (k) {
                key = k;
                return webcrypto.subtle.exportKey(
                    "pkcs8",
                    key.privateKey
                    );
            })
            .then(function (pkcs8) {
                assert.equal(pkcs8 instanceof ArrayBuffer, true, "pkcs8 is not ArrayBuffer");
                return webcrypto.subtle.importKey(
                    "pkcs8",
                    pkcs8,
                    {
                        name: "ECDH",
                        namedCurve: "P-256",
                    },
                    false,
                    ["decrypt"]
                    )
            })
            .then(function (k) {
                assert.equal(k.type === "private", true, "Key is not Private");
                assert.equal(k.algorithm.name === "ECDH", true, "Key is not ECDH");
            })
            .then(done, done);
    })

    it("Ecdsa export/import SPKI", function (done) {

        var key = null;
        webcrypto.subtle.generateKey(
            {
                name: "ECDH",
                namedCurve: "P-256",
            },
            false,
            ["decrypt", "encrypt"]
            )
            .then(function (k) {
                key = k;
                return webcrypto.subtle.exportKey(
                    "spki",
                    key.publicKey
                    );
            })
            .then(function (spki) {
                assert.equal(spki instanceof ArrayBuffer, true, "spki is not ArrayBuffer");
                return webcrypto.subtle.importKey(
                    "spki",
                    spki,
                    {
                        name: "ECDH",
                        namedCurve: "P-256",
                    },
                    false,
                    ["encrypt"]
                    )
            })
            .then(function (k) {
                assert.equal(k.type === "public", true, "Key is not Public");
                assert.equal(k.algorithm.name === "ECDH", true, "Key is not ECDH");
            })
            .then(done, done);
    })

    it("Ecdsa test signature from Chrome crypto", function (done) {
        var key, sig;
        webcrypto.subtle.importKey(
            "jwk", //can be "jwk" (public or private), "spki" (public only), or "pkcs8" (private only)
            JSON.parse(ecdsa_pubkey_json_384)
            ,
            {   //these are the algorithm options
                name: "ECDSA",
                namedCurve: "P-384", //can be "P-256", "P-384", or "P-521"
            },
            true, //whether the key is extractable (i.e. can be used in exportKey)
            ["verify"] //"verify" for public key import, "sign" for private key imports
            )
            .then(function (k) {
                key = k;
                return webcrypto.subtle.exportKey(
                    "jwk",
                    key
                    );
            })
            .then(function () {
                sig = new Buffer(ecdsa_signature_384_sha256, "base64");
                return webcrypto.subtle.verify(
                    {
                        name: "ECDSA",
                        hash: { name: "SHA-256" }
                    },
                    key, //from generateKey or importKey above
                    sig,
                    TEST_MESSAGE  //ArrayBuffer of the data
                    )
            })
            .then(function (v) {
                assert.equal(v, true, "Signature is not valid")
            })
            .then(done, done);
    })
})