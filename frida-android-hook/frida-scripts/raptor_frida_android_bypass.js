/*
 * raptor_frida_android_*.js - Frida snippets for Android
 * Copyright (c) 2017 Marco Ivaldi <raptor@0xdeadbeef.info>
 *
 * Frida.re JS script snippets for Android instrumentation.
 * See https://www.frida.re/ and https://codeshare.frida.re/
 * for further information on this powerful tool.
 *
 * "We want to help others achieve interop through reverse
 * engineering" -- @oleavr
 *
 * Many thanks to Maurizio Agazzini <inode@wayreth.eu.org>
 * and Federico Dotta <federico.dotta@mediaservice.net>.
 *
 * Example usage:
 * # frida -U -f com.xxx.yyy -l raptor_frida_android.js --no-pause
 */

setTimeout(function() { // avoid java.lang.ClassNotFoundException

	Java.perform(function() {

		// Root detection bypass example

		var hook = Java.use("com.target.utils.RootCheck");
		console.log("info: hooking target class");

		hook.isRooted.overload().implementation = function() {
			console.log("info: entered target method");
			
			// obtain old retval
			var retval = this.isRooted.overload().call(this);
			console.log("old ret value: " + retval);

			// set new retval
			var retnew = false;
			console.log("new ret value: " + retnew);
			return retnew;
		}

	});   

}, 0);
