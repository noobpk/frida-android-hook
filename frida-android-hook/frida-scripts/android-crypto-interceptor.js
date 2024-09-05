/**@@@+++@@@@******************************************************************
 **
 ** Android Crypto Interceptor frida script v1.4 hyugogirubato
 **
 ** frida -D "DEVICE" -l "crypto.js" -f "PACKAGE"
 **
 ** Update: Removed detection of UUID form in hex format.
 **
 ***@@@---@@@@******************************************************************
 */


// Custom params
const MODE = {
    KeyGenerator: true,
    KeyPairGenerator: true,
    SecretKeySpec: true,
    MessageDigest: true,
    SecretKeyFactory: true,
    Signature: true,
    Cipher: true,
    Mac: true,
    KeyGenParameterSpec: true,
    IvParameterSpec: true
};


let index = 0; // color index
const STRING = Java.use("java.lang.String");
const BASE64 = Java.use("java.util.Base64");
const COLORS = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

const randomColor = () => {
    const colorKeys = Object.keys(COLORS).filter(key => key !== "reset" && key !== "red");
    index = (index + 1) % colorKeys.length;
    return COLORS[colorKeys[index]];
}

const bytesToString = (bytes) => {
    return bytes === null ? null : STRING.$new(bytes).toString();
}

const bytesToBase64 = (bytes) => {
    if (bytes !== null) {
        try {
            return BASE64.getEncoder().encodeToString(bytes);
        } catch {
            return BASE64.getEncoder().encodeToString([bytes & 0xff]);
        }
    }
    return null;
}

const Base64ToHex = (base64) => {
    const bytes = BASE64.getDecoder().decode(base64);
    let hexData = "";
    for (let i = 0; i < bytes.length; i++) {
        let value = bytes[i].toString(16);
        if (value.length % 2 === 1) {
            value = "0" + value
        }
        hexData += value
    }
    return hexData;
}

const showVariable = (module, items, colorKey, hexValue = false) => {
    console.log(`${colorKey}[+] onEnter: ${module}${COLORS.reset}`);
    for (let i = 0; i < items.length; i++) {
        console.log(`${colorKey}  --> [${i}] ${items[i].key}: ${items[i].value}${COLORS.reset}`);

        // Hex
        if (items[i].key.includes("Base64") && items[i].value !== null) {
            const key = items[i].key.replace("Base64", "HEX");
            const value = Base64ToHex(items[i].value);
            if ((!value.includes("-") && [32, 40, 48, 64].includes(value.length)) || hexValue) {
                console.log(`${colorKey}  --> [${i}] ${key}: ${value}${COLORS.reset}`);
            }
        }
    }
    console.log(`${colorKey}[-] onLeave: ${module}${COLORS.reset}`);
}


setTimeout(function () {
    console.log("---");
    console.log("Capturing Android app...");

    if (Java.available) {
        console.log("[*] Java available");
        Java.perform(function () {

            if (MODE.KeyGenerator) {
                const colorKey = randomColor();
                console.log("[*] Module attached: javax.crypto.KeyGenerator");
                const keyGenerator = Java.use("javax.crypto.KeyGenerator");

                keyGenerator.generateKey.implementation = function () {
                    showVariable("keyGenerator.generateKey", [], colorKey);
                    return this.generateKey();
                };

                keyGenerator.getInstance.overload("java.lang.String").implementation = function (arg0) {
                    showVariable("keyGenerator.getInstance", [
                        {key: "Algorithm", value: arg0}
                    ], colorKey);
                    return this.getInstance(arg0);
                };

                keyGenerator.getInstance.overload("java.lang.String", "java.lang.String").implementation = function (arg0, arg1) {
                    showVariable("keyGenerator.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                keyGenerator.getInstance.overload("java.lang.String", "java.security.Provider").implementation = function (arg0, arg1) {
                    showVariable("keyGenerator.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

            }

            if (MODE.KeyPairGenerator) {
                const colorKey = randomColor();
                console.log("[*] Module attached: java.security.KeyPairGenerator");
                const keyPairGenerator = Java.use("java.security.KeyPairGenerator");
                keyPairGenerator.getInstance.overload("java.lang.String").implementation = function (arg0) {
                    showVariable("keyPairGenerator.getInstance", [
                        {key: "Algorithm", value: arg0}
                    ], colorKey);
                    return this.getInstance(arg0);
                };

                keyPairGenerator.getInstance.overload("java.lang.String", "java.lang.String").implementation = function (arg0, arg1) {
                    showVariable("keyPairGenerator.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                keyPairGenerator.getInstance.overload("java.lang.String", "java.security.Provider").implementation = function (arg0, arg1) {
                    showVariable("keyPairGenerator.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };
            }

            if (MODE.SecretKeySpec) {
                const colorKey = randomColor();
                console.log("[*] Module attached: javax.crypto.spec.SecretKeySpec");
                const secretKeySpec = Java.use("javax.crypto.spec.SecretKeySpec");
                secretKeySpec.$init.overload("[B", "java.lang.String").implementation = function (key, cipher) {
                    const keyBase64 = bytesToBase64(key);
                    const keyString = bytesToString(key);
                    showVariable("secretKeySpec.init", [
                        {key: "Key Base64", value: keyBase64},
                        {key: "Key String", value: keyString},
                        {key: "Algorithm", value: cipher}
                    ], colorKey);
                    return secretKeySpec.$init.overload("[B", "java.lang.String").call(this, key, cipher);
                }
            }

            if (MODE.MessageDigest) {
                const colorKey = randomColor();
                console.log("[*] Module attached: java.security.MessageDigest");
                const messageDigest = Java.use("java.security.MessageDigest");
                messageDigest.getInstance.overload("java.lang.String").implementation = function (arg0) {
                    showVariable("messageDigest.getInstance", [
                        {key: "Algorithm", value: arg0}
                    ], colorKey);
                    return this.getInstance(arg0);
                };

                messageDigest.getInstance.overload("java.lang.String", "java.lang.String").implementation = function (arg0, arg1) {
                    showVariable("messageDigest.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                messageDigest.getInstance.overload("java.lang.String", "java.security.Provider").implementation = function (arg0, arg1) {
                    showVariable("messageDigest.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                messageDigest.update.overload("[B").implementation = function (input) {
                    const inputBase64 = bytesToBase64(input);
                    const inputString = bytesToString(input);
                    showVariable("messageDigest.update", [
                        {key: "Input Base64", value: inputBase64},
                        {key: "Input String", value: inputString}
                    ], colorKey);
                    return this.update.overload("[B").call(this, input);
                };

                messageDigest.digest.overload().implementation = function () {
                    const output = messageDigest.digest.overload().call(this);
                    const outputBase64 = bytesToBase64(output);
                    const outputString = bytesToString(output);
                    showVariable("messageDigest.digest", [
                        {key: "Output Base64", value: outputBase64},
                        {key: "Output String", value: outputString},
                        {key: "Algorithm", value: this.getAlgorithm()}
                    ], colorKey);
                    return output;
                };

                /*
                messageDigest.digest.overload("[B").implementation = function (input) {
                    const inputBase64 = bytesToBase64(input);
                    const inputString = bytesToString(input);
                    showVariable("messageDigest.digest", [
                        {key: "Input Base64", value: inputBase64},
                        {key: "Input String", value: inputString},
                        {key: "Algorithm", value: this.getAlgorithm()}
                    ], colorKey);
                    return this.digest.overload("[B").call(this, input);
                };

                messageDigest.digest.overload("[B", "int", "int").implementation = function (input, offset, len) {
                    const inputBase64 = bytesToBase64(input);
                    const inputString = bytesToString(input);
                    showVariable("messageDigest.digest", [
                        {key: "Input Base64", value: inputBase64},
                        {key: "Input String", value: inputString},
                        {key: "Algorithm", value: this.getAlgorithm()},
                        {key: "Offset", value: offset},
                        {key: "Length", value: len}
                    ], colorKey);
                    return this.digest.overload("[B", "int", "int").call(this, input, offset, len);
                };
                 */

            }

            if (MODE.SecretKeyFactory) {
                const colorKey = randomColor();
                console.log("[*] Module attached: javax.crypto.SecretKeyFactory");
                const secretKeyFactory = Java.use("javax.crypto.SecretKeyFactory");
                secretKeyFactory.getInstance.overload("java.lang.String").implementation = function (arg0) {
                    showVariable("secretKeyFactory.getInstance", [
                        {key: "Algorithm", value: arg0}
                    ], colorKey);
                    return this.getInstance(arg0);
                };

                secretKeyFactory.getInstance.overload("java.lang.String", "java.lang.String").implementation = function (arg0, arg1) {
                    showVariable("secretKeyFactory.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                secretKeyFactory.getInstance.overload("java.lang.String", "java.security.Provider").implementation = function (arg0, arg1) {
                    showVariable("secretKeyFactory.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };
            }

            if (MODE.Signature) {
                const colorKey = randomColor();
                console.log("[*] Module attached: java.security.Signature");
                const signature = Java.use("java.security.Signature");
                signature.getInstance.overload("java.lang.String").implementation = function (arg0) {
                    showVariable("signature.getInstance", [
                        {key: "Algorithm", value: arg0}
                    ], colorKey);
                    return this.getInstance(arg0);
                };

                signature.getInstance.overload("java.lang.String", "java.lang.String").implementation = function (arg0, arg1) {
                    showVariable("signature.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                signature.getInstance.overload("java.lang.String", "java.security.Provider").implementation = function (arg0, arg1) {
                    showVariable("signature.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };
            }

            if (MODE.Cipher) {
                const colorKey = randomColor();
                console.log("[*] Module attached: javax.crypto.Cipher");
                const cipher = Java.use("javax.crypto.Cipher");
                cipher.init.overload("int", "java.security.Key").implementation = function (opmode, key) {
                    showVariable("cipher.init", [
                        {key: "Key", value: bytesToBase64(key.getEncoded())},
                        {key: "Opmode", value: this.getOpmodeString(opmode)},
                        {key: "Algorithm", value: this.getAlgorithm()}
                    ], colorKey);
                    this.init.overload("int", "java.security.Key").call(this, opmode, key);
                }

                cipher.init.overload("int", "java.security.cert.Certificate").implementation = function (opmode, certificate) {
                    showVariable("cipher.init", [
                        {key: "Certificate", value: bytesToBase64(certificate.getEncoded())},
                        {key: "Opmode", value: this.getOpmodeString(opmode)},
                        {key: "Algorithm", value: this.getAlgorithm()}
                    ], colorKey);
                    this.init.overload("int", "java.security.cert.Certificate").call(this, opmode, certificate);
                }

                cipher.init.overload("int", "java.security.Key", "java.security.AlgorithmParameters").implementation = function (opmode, key, algorithmParameter) {
                    showVariable("cipher.init", [
                        {key: "Key", value: bytesToBase64(key.getEncoded())},
                        {key: "Opmode", value: this.getOpmodeString(opmode)},
                        {key: "Algorithm", value: this.getAlgorithm()}
                    ], colorKey);
                    this.init.overload("int", "java.security.Key", "java.security.AlgorithmParameters").call(this, opmode, key, algorithmParameter);
                }

                cipher.init.overload("int", "java.security.Key", "java.security.spec.AlgorithmParameterSpec").implementation = function (opmode, key, algorithmParameter) {
                    showVariable("cipher.init", [
                        {key: "Key", value: bytesToBase64(key.getEncoded())},
                        {key: "Opmode", value: this.getOpmodeString(opmode)},
                        {key: "Algorithm", value: this.getAlgorithm()}
                    ], colorKey);
                    this.init.overload("int", "java.security.Key", "java.security.spec.AlgorithmParameterSpec").call(this, opmode, key, algorithmParameter);
                }

                cipher.getInstance.overload("java.lang.String").implementation = function (arg0) {
                    showVariable("cipher.getInstance", [
                        {key: "Algorithm", value: arg0}
                    ], colorKey);
                    return this.getInstance(arg0);
                };

                cipher.getInstance.overload("java.lang.String", "java.lang.String").implementation = function (arg0, arg1) {
                    showVariable("cipher.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                cipher.getInstance.overload("java.lang.String", "java.security.Provider").implementation = function (arg0, arg1) {
                    showVariable("cipher.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                cipher.doFinal.overload("[B").implementation = function (arg0) {
                    const inputBase64 = bytesToBase64(arg0);
                    const inputString = bytesToString(arg0);
                    const output = this.doFinal.overload("[B").call(this, arg0);
                    const outputBase64 = bytesToBase64(output);
                    showVariable("cipher.doFinal", [
                        {key: "Input Base64", value: inputBase64},
                        {key: "Input String", value: inputString},
                        {key: "Output Base64", value: outputBase64}
                    ], colorKey);
                    return output;
                };


                cipher.doFinal.overload("[B", "int").implementation = function (arg0, arg1) {
                    const inputBase64 = bytesToBase64(arg0);
                    const inputString = bytesToString(arg0);
                    const output = this.doFinal.overload("[B", "int").call(this, arg0, arg1);
                    const outputBase64 = bytesToBase64(output);
                    showVariable("cipher.doFinal", [
                        {key: "Input Base64", value: inputBase64},
                        {key: "Input String", value: inputString},
                        {key: "Output Base64", value: outputBase64}
                    ], colorKey);
                    return output;
                }

                cipher.doFinal.overload("[B", "int", "int").implementation = function (arg0, arg1, arg2) {
                    const inputBase64 = bytesToBase64(arg0);
                    const inputString = bytesToString(arg0);
                    const output = this.doFinal.overload("[B", "int", "int").call(this, arg0, arg1, arg2);
                    const outputBase64 = bytesToBase64(output);
                    showVariable("cipher.doFinal", [
                        {key: "Input Base64", value: inputBase64},
                        {key: "Input String", value: inputString},
                        {key: "Output Base64", value: outputBase64}
                    ], colorKey);
                    return output;
                }

                cipher.doFinal.overload("[B", "int", "int", "[B").implementation = function (arg0, arg1, arg2, arg3) {
                    const inputBase64 = bytesToBase64(arg0);
                    const inputString = bytesToString(arg0);
                    const output = this.doFinal.overload("[B", "int", "int", "[B").call(this, arg0, arg1, arg2, arg3);
                    const outputBase64 = bytesToBase64(output);
                    showVariable("cipher.doFinal", [
                        {key: "Input Base64", value: inputBase64},
                        {key: "Input String", value: inputString},
                        {key: "Output Base64", value: outputBase64}
                    ], colorKey);
                    return output;
                }

                cipher.doFinal.overload("[B", "int", "int", "[B", "int").implementation = function (arg0, arg1, arg2, arg3, arg4) {
                    const inputBase64 = bytesToBase64(arg0);
                    const inputString = bytesToString(arg0);
                    const output = this.doFinal.overload("[B", "int", "int", "[B", "int").call(this, arg0, arg1, arg2, arg3, arg4);
                    const outputBase64 = bytesToBase64(output);
                    showVariable("cipher.doFinal", [
                        {key: "Input Base64", value: inputBase64},
                        {key: "Input String", value: inputString},
                        {key: "Output Base64", value: outputBase64}
                    ], colorKey);
                    return output;
                }
            }

            if (MODE.Mac) {
                const colorKey = randomColor();
                console.log("[*] Module attached: javax.crypto.Mac");
                const mac = Java.use("javax.crypto.Mac");
                mac.getInstance.overload("java.lang.String").implementation = function (arg0) {
                    showVariable("mac.getInstance", [
                        {key: "Algorithm", value: arg0}
                    ], colorKey);
                    return this.getInstance(arg0);
                };

                mac.getInstance.overload("java.lang.String", "java.lang.String").implementation = function (arg0, arg1) {
                    showVariable("mac.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };

                mac.getInstance.overload("java.lang.String", "java.security.Provider").implementation = function (arg0, arg1) {
                    showVariable("mac.getInstance", [
                        {key: "Algorithm", value: arg0},
                        {key: "Provider", value: arg1}
                    ], colorKey);
                    return this.getInstance(arg0, arg1);
                };
            }

            if (MODE.KeyGenParameterSpec) {
                const colorKey = randomColor();
                console.log("[*] Module attached: android.security.keystore.KeyGenParameterSpec$Builder");
                const useKeyGen = Java.use("android.security.keystore.KeyGenParameterSpec$Builder");
                useKeyGen.$init.overload("java.lang.String", "int").implementation = function (keyStoreAlias, purpose) {
                    let purposeStr = "";
                    if (purpose === 1) {
                        purposeStr = "encrypt";
                    } else if (purpose === 2) {
                        purposeStr = "decrypt";
                    } else if (purpose === 3) {
                        purposeStr = "decrypt|encrypt";
                    } else if (purpose === 4) {
                        purposeStr = "sign";
                    } else if (purpose === 8) {
                        purposeStr = "verify";
                    } else {
                        purposeStr = purpose;
                    }

                    showVariable("KeyGenParameterSpec.init", [
                        {key: "KeyStoreAlias", value: keyStoreAlias},
                        {key: "Purpose", value: purposeStr}
                    ], colorKey);
                    return useKeyGen.$init.overload("java.lang.String", "int").call(this, keyStoreAlias, purpose);
                }

                useKeyGen.setBlockModes.implementation = function (modes) {
                    showVariable("KeyGenParameterSpec.setBlockModes", [
                        {key: "BlockMode", value: modes.toString()}
                    ], colorKey);
                    return useKeyGen.setBlockModes.call(this, modes);
                }

                useKeyGen.setDigests.implementation = function (digests) {
                    showVariable("KeyGenParameterSpec.setDigests", [
                        {key: "Digests", value: digests.toString()}
                    ], colorKey);
                    return useKeyGen.setDigests.call(this, digests);
                }

                useKeyGen.setKeySize.implementation = function (keySize) {
                    showVariable("KeyGenParameterSpec.setKeySize", [
                        {key: "KeySize", value: keySize}
                    ], colorKey);
                    return useKeyGen.setKeySize.call(this, keySize);
                }

                useKeyGen.setEncryptionPaddings.implementation = function (paddings) {
                    showVariable("KeyGenParameterSpec.setEncryptionPaddings", [
                        {key: "Paddings", value: paddings.toString()}
                    ], colorKey);
                    return useKeyGen.setEncryptionPaddings.call(this, paddings);
                }

                useKeyGen.setSignaturePaddings.implementation = function (paddings) {
                    showVariable("KeyGenParameterSpec.setSignaturePaddings", [
                        {key: "Paddings", value: paddings.toString()}
                    ], colorKey);
                    return useKeyGen.setSignaturePaddings.call(this, paddings);
                }

                useKeyGen.setAlgorithmParameterSpec.implementation = function (spec) {
                    showVariable("KeyGenParameterSpec.setAlgorithmParameterSpec", [
                        {key: "ParameterSpec", value: spec.toString()}
                    ], colorKey);
                    return useKeyGen.setAlgorithmParameterSpec.call(this, spec);
                }

                useKeyGen.build.implementation = function () {
                    showVariable("KeyGenParameterSpec.build", [], colorKey);
                    return useKeyGen.build.call(this);
                }
            }

            if (MODE.IvParameterSpec) {
                const colorKey = randomColor();
                console.log("[*] Module attached: javax.crypto.spec.IvParameterSpec");
                const ivParameter = Java.use("javax.crypto.spec.IvParameterSpec");
                ivParameter.$init.overload("[B").implementation = function (ivKey) {
                    showVariable("IvParameterSpec.init", [
                        {key: "IV Key", value: bytesToBase64(ivKey)}
                    ], colorKey);
                    return this.$init.overload("[B").call(this, ivKey);
                }

                ivParameter.$init.overload("[B", "int", "int").implementation = function (ivKey, offset, len) {
                    showVariable("IvParameterSpec.init", [
                        {key: "IV Key", value: bytesToBase64(ivKey)},
                        {key: "Offset", value: offset},
                        {key: "Length", value: len}
                    ], colorKey);
                    return this.$init.overload("[B", "int", "int").call(this, ivKey, offset, len);
                }
            }

        });
    } else {
        console.log(`${COLORS.red}[!] Java unavailable${COLORS.reset}`);
    }

    console.log("Capturing setup completed");
    console.log("---");
}, 0);