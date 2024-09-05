/*
 * Android okhttp3 Traffic Interceptor
 * Author: Vinay Kumar Rasala (Linuxinet)
 * Organization: XYSec Labs (Appknox)
 * Description: Intercepts network traffic using Frida for specified target hosts, logging API calls and WebView URL loads.
 * Supported Libraries: okhttp3
 */

setImmediate(function() {
    console.log("[*] Waiting for Traffic");
    console.warn("[*] Please Check Target Hosts section in the code, if u dont see requests");

    Java.perform(function() {
        var okhttp3 = Java.use('okhttp3.OkHttpClient');
        var webViewClient = Java.use('android.webkit.WebViewClient');

        // ANSI escape code for red color
        var redColor = '\u001b[31m';
        // ANSI escape code for green color
        var greenColor = '\u001b[32m';
        // ANSI escape code to reset color
        var resetColor = '\u001b[0m';

        var targetHosts = [];
        // Replace with your target hosts to set your scope 
        // eg: targetHosts = ["google.com", "frida.re", "github.com"]
        // leave empty (eg: []) to print all requests


        // Intercept API calls
        var originalNewCall = okhttp3.newCall.overload('okhttp3.Request');
        originalNewCall.implementation = function(request) {
            // Get the request's URL and extract the host
            var requestUrl = request.url().toString();
            var urlParts = requestUrl.split("/");
            var extractedHost = urlParts[2]; // Assumes the host is at index 2
            // console.log("request url: ", requestUrl)
            // console.log("request parts: ", urlParts)
            // console.log("extractedHost: ", extractedHost)


            if (targetHosts.includes(extractedHost) || targetHosts.length === 0) {

                var requestEndpoint = requestUrl.replace(/^(https?:\/\/[^\/]+)(\/.*)$/, '$2');
                // Construct and print request headers
                var requestHeaders = request.headers();
                console.log(redColor + "[API Call]" + resetColor);
                console.log("             ");
                console.log(greenColor + request.method() + " " + requestEndpoint);
                // Add the Host header with the extracted host
                requestHeaders = requestHeaders.newBuilder()
                    .add("Host", extractedHost)
                    .build();
                // console.log(greenColor + "Request Headers:");
                var requestHeaderNames = requestHeaders.names();
                var requestHeaderNamesArray = requestHeaderNames.toArray();

                for (var i = 0; i < requestHeaderNamesArray.length; i++) {
                    var headerName = requestHeaderNamesArray[i];
                    var headerValue = requestHeaders.get(headerName);
                    headerValue = decodeURIComponent(headerValue); // Decode header value
                    console.log(greenColor + headerName + ": " + headerValue + resetColor);
                }
                console.log("             ");
                console.log("             ");


                console.log(greenColor + requestBodyToString(request.body()) + resetColor);
                console.log(redColor + "============================" + resetColor);

                var newRequest = request.newBuilder().headers(requestHeaders).build();
                var response = this.newCall(newRequest).execute();

                // Construct and print response headers
                console.log(redColor + "[API Response]" + " - [" + requestEndpoint + "]" + resetColor);
                console.log("             ");
                console.log(greenColor + response.code() + " " + response.message() + resetColor);
                var responseHeaders = response.headers();
                var responseHeaderNames = responseHeaders.names();
                var responseHeaderNamesArray = responseHeaderNames.toArray();
                for (var i = 0; i < responseHeaderNamesArray.length; i++) {
                    var responseHeaderName = responseHeaderNamesArray[i];
                    var responseHeaderValue = responseHeaders.get(responseHeaderName);
                    console.log(greenColor + responseHeaderName + ": " + responseHeaderValue + resetColor);
                }
                console.log("             ");

                // console.log(greenColor  + response.message());
                var responseBody = response.body();
                if (responseBody !== null) {
                    if (response.isSuccessful()) {
                        console.log(greenColor + responseBody.string() + resetColor + resetColor);
                    } else {
                        console.log(redColor + "Error: Response not successful" + resetColor);
                    }
                } else {
                    console.log(greenColor + "Error: Empty response body" + resetColor);
                }
                console.log(redColor + "============================" + resetColor);
                return this.newCall(request);

            } else {
                // Return a new Call instance for Frida to continue instrumenting
                return this.newCall(request);
            }
        };

        // Intercept WebView URL loads
        var shouldOverrideUrlLoading = webViewClient.shouldOverrideUrlLoading.overload('android.webkit.WebView', 'java.lang.String');
        shouldOverrideUrlLoading.implementation = function(view, url) {
            console.log(redColor + "[WebView URL]: " + url + resetColor);
            return shouldOverrideUrlLoading.call(this, view, url);
        };
    });
});

function requestBodyToString(requestBody) {
    if (requestBody === null) {
        return '';
    }

    var buffer = Java.use('okio.Buffer').$new();
    requestBody.writeTo(buffer);
    return buffer.readUtf8();
}