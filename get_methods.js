Java.perform(function() {
	var hook;
	var targetClass = 'java.lang.Enum'; //change your class here!!
	try{
		console.log('[*] Getting Methods and Implementations of Class: ' + targetClass)
		console.log(" ")
		hook = Java.use(targetClass);
	} catch (err){
		console.log('[Android] Hooking ' + targetClass + ' [\"Error\"] => ' + err);
		return;
	}
	var methods = hook.class.getDeclaredMethods();
	hook.$dispose;
	methods.forEach(function(method) { 
		console.log('[Android] ' + method)
	});
	console.log('[*] Done!! Ctrl-C to Exit');
});