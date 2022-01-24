/* Description: Show specific class and method
 * Mode: S+A
 * Version: 1.0
 * Credit: https://github.com/interference-security/frida-scripts/tree/master/android
 * Author: @interference-security
 */
Java.perform(function() {
	//enter class name here: example android.security.keystore.KeyGenParameterSpec$Builder
	//class inside a class is defined using CLASS_NAME$SUB_CLASS_NAME
	var class_name = "android.security.keystore.KeyGenParameterSpec$Builder";
	var db1 = Java.use(class_name);
	var methodArr = db1.class.getMethods();
	console.log("[*] Class Name: " + class_name)
	console.log("[*] Method Names:")
	for(var m in methodArr)
	{
		console.log(methodArr[m]);
	}
});
