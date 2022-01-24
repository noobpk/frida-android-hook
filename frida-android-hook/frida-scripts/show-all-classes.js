/* Description: Show all class name
 * Mode: S+A
 * Version: 1.0
 * Credit: https://github.com/interference-security/frida-scripts/tree/master/android
 * Author: @interference-security
 */
Java.perform(function() {
	Java.enumerateLoadedClasses({
		onMatch: function(className) {
			console.log(className);
		},
		onComplete: function() {}
	});
});
