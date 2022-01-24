/* 
   Android SSL Re-pinning frida script v0.2 030417-pier 

   $ adb push burpca-cert-der.crt /data/local/tmp/cert-der.crt
   $ frida -U -f it.app.mobile -l frida-android-repinning.js --no-pause

   https://techblog.mediaservice.net/2017/07/universal-android-ssl-pinning-bypass-with-frida/
   
   UPDATE 20191605: Fixed undeclared var. Thanks to @oleavr and @ehsanpc9999 !
*/

setTimeout(function(){
    Java.perform(function (){
        try {
            console.log("");
            console.log("[.] Cert Pinning Bypass/Re-Pinning");

            var CertificateFactory = Java.use("java.security.cert.CertificateFactory");
            var FileInputStream = Java.use("java.io.FileInputStream");
            var BufferedInputStream = Java.use("java.io.BufferedInputStream");
            var X509Certificate = Java.use("java.security.cert.X509Certificate");
            var KeyStore = Java.use("java.security.KeyStore");
            var TrustManagerFactory = Java.use("javax.net.ssl.TrustManagerFactory");
            var SSLContext = Java.use("javax.net.ssl.SSLContext");

            // Load CAs from an InputStream
            console.log("[+] Loading our CA...")
            var cf = CertificateFactory.getInstance("X.509");
            
            try {
                var fileInputStream = FileInputStream.$new("/data/local/tmp/cert-der.crt");
            }
            catch(err) {
                console.log("[o] " + err);
            }
            
            var bufferedInputStream = BufferedInputStream.$new(fileInputStream);
            var ca = cf.generateCertificate(bufferedInputStream);
            bufferedInputStream.close();

            var certInfo = Java.cast(ca, X509Certificate);
            console.log("[o] Our CA Info: " + certInfo.getSubjectDN());

            // Create a KeyStore containing our trusted CAs
            console.log("[+] Creating a KeyStore for our CA...");
            var keyStoreType = KeyStore.getDefaultType();
            var keyStore = KeyStore.getInstance(keyStoreType);
            keyStore.load(null, null);
            keyStore.setCertificateEntry("ca", ca);
            
            // Create a TrustManager that trusts the CAs in our KeyStore
            console.log("[+] Creating a TrustManager that trusts the CA in our KeyStore...");
            var tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
            var tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
            tmf.init(keyStore);
            console.log("[+] Our TrustManager is ready...");

            console.log("[+] Hijacking SSLContext methods now...")
            console.log("[-] Waiting for the app to invoke SSLContext.init()...")

            SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").implementation = function(a,b,c) {
                console.log("[o] App invoked javax.net.ssl.SSLContext.init...");
                SSLContext.init.overload("[Ljavax.net.ssl.KeyManager;", "[Ljavax.net.ssl.TrustManager;", "java.security.SecureRandom").call(this, a, tmf.getTrustManagers(), c);
                console.log("[+] SSLContext initialized with our custom TrustManager!");
            }
        }
        catch (e) {
            console.log(e);
        }
//Universal Android SSL Pinning Bypass 2
        try {
            var array_list = Java.use("java.util.ArrayList");
            var ApiClient = Java.use('com.android.org.conscrypt.TrustManagerImpl');

            ApiClient.checkTrustedRecursive.implementation = function(a1, a2, a3, a4, a5, a6) {
                console.log('Bypassing SSL Pinning');
                var k = array_list.$new();
                return k;
            }
        }
        catch (e) {
            console.log(e);
        }
// Android Certificate Pinning Bypass
        try {
            // Invalidate the certificate pinner set up
            var OkHttpClient = Java.use("com.squareup.okhttp.OkHttpClient");
            OkHttpClient.setCertificatePinner.implementation = function(certificatePinner){
                // do nothing
                console.log("Called!");
                return this;
            };

            // Invalidate the certificate pinnet checks (if "setCertificatePinner" was called before the previous invalidation)
            var CertificatePinner = Java.use("com.squareup.okhttp.CertificatePinner");
            CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(p0, p1){
                // do nothing
                console.log("Called! [Certificate]");
                return;
            };
            CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(p0, p1){
                // do nothing
                console.log("Called! [List]");
                return;
            };
        }
        catch (e) {
            console.log(e);
        }
//okhttp3-certificate-pinner-bypass
        try {
            var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
            var ArrayList = Java.use("java.util.ArrayList");
            TrustManagerImpl.verifyChain.implementation = function(untrustedChain, trustAnchorChain,
                host, clientAuth, ocspData, tlsSctData) {
                console.log("[+] Bypassing TrustManagerImpl->verifyChain()");
                return untrustedChain;
            }
            TrustManagerImpl.checkTrustedRecursive.implementation = function(certs, host, clientAuth, untrustedChain,
                trustAnchorChain, used) {
                console.log("[+] Bypassing TrustManagerImpl->checkTrustedRecursive()");
                return ArrayList.$new();
            };
            var CertificatePinner = Java.use('okhttp3.CertificatePinner');
            console.log("[+] Bypassing CertificatePinner->check()");
            CertificatePinner.check.overload('java.lang.String', 'java.util.List').implementation = function(hostname, peerCertificates) {
                return;
            }
        }
        catch (e) {
            console.log(e);
        }
//okhttp3-pinning-bypass
        try {
            var okhttp3_CertificatePinner_class = null;
            try {
                okhttp3_CertificatePinner_class = Java.use('okhttp3.CertificatePinner');    
            } catch (err) {
                console.log('[-] OkHTTPv3 CertificatePinner class not found. Skipping.');
                okhttp3_CertificatePinner_class = null;
            }

            if(okhttp3_CertificatePinner_class != null) {

                try{
                    okhttp3_CertificatePinner_class.check.overload('java.lang.String', 'java.util.List').implementation = function (str,list) {
                        console.log('[+] Bypassing OkHTTPv3 1: ' + str);
                        return true;
                    };
                    console.log('[+] Loaded OkHTTPv3 hook 1');
                } catch(err) {
                    console.log('[-] Skipping OkHTTPv3 hook 1');
                }

                try{
                    okhttp3_CertificatePinner_class.check.overload('java.lang.String', 'java.security.cert.Certificate').implementation = function (str,cert) {
                        console.log('[+] Bypassing OkHTTPv3 2: ' + str);
                        return true;
                    };
                    console.log('[+] Loaded OkHTTPv3 hook 2');
                } catch(err) {
                    console.log('[-] Skipping OkHTTPv3 hook 2');
                }

                try {
                    okhttp3_CertificatePinner_class.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function (str,cert_array) {
                        console.log('[+] Bypassing OkHTTPv3 3: ' + str);
                        return true;
                    };
                    console.log('[+] Loaded OkHTTPv3 hook 3');
                } catch(err) {
                    console.log('[-] Skipping OkHTTPv3 hook 3');
                }

                try {
                    okhttp3_CertificatePinner_class['check$okhttp'].implementation = function (str,obj) {
                        console.log('[+] Bypassing OkHTTPv3 4 (4.2+): ' + str);
                    };
                    console.log('[+] Loaded OkHTTPv3 hook 4 (4.2+)');
                } catch(err) {
                    console.log('[-] Skipping OkHTTPv3 hook 4 (4.2+)');
                }

            }
        }
        catch (e) {
            console.log(e);
        }

    });
},0);