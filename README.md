# frida-android-hook
A script that helps you trace classes, functions, and modify the return values of methods on Android platform

For iOS platform: https://github.com/noobpk/frida-ios-hook

## Update

[Version: 1.0]

	[+] Feature: Hook and return value of object
	
	[+] Feature: Start frida-server via command
	
	[+] Feature: List installed apps in phone

## Usage
1. Git clone https://github.com/noobpk/frida-android-hook
1. cd frida-android-hook/
1. Start Frida-server: `python3 hook.py --fridaserver`
1. ```python3 hook.py -p <package> -s <script>```

If you run the script but it doesn't work, you can try the following:
```frida -U -f package -l script.js```




