Java.perform(function() {
	var classes = Java.enumerateLoadedClassesSync();
	console.log("[*] Started: Find All Class In Application");
	console.log(" ")
	classes.forEach(function(aClass) {
		try{
			var className = aClass.match(/[L](.*);/)[1].replace(/\//g, ".");
			console.log('[Android]: ' + className);
		}
		catch(err){}
	});
	console.log('[*] Done!! Ctrl-C to Exit');
});