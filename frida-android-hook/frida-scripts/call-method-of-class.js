/* Description: Call method of class
 * Mode: S+A
 * Version: 1.0
 * Credit: https://11x256.github.io/Frida-hooking-android-part-2/ & https://github.com/interference-security/frida-scripts/tree/master/android
 * Author: @interference-security
 */

//Update fully qualified activity class name here
Java.choose("com.example.app.activity_class_name" , {
  onMatch : function(instance){ //This function will be called for every instance found by frida
    console.log("Found instance: "+instance);
    console.log("Result of method call: " + instance.method_name_to_call()); //Update method name here to call
  },
  onComplete:function(){}
});
