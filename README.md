# frida-android-hook
A script that helps you trace classes, functions, and modify the return values of methods on Android platform

For iOS platform: https://github.com/noobpk/frida-ios-hook

<img width="544" alt="image" src="https://user-images.githubusercontent.com/31820707/108661418-60d4b500-74fe-11eb-81ed-c164df9ef4a5.png">

## Update

[Version: 1.1]

	[+] Feature: Hook and return value of object
	
	[+] Feature: Start/Stop frida-server via options on tool
	
	[+] Feature: List installed apps in phone

## Usage
1. Git clone https://github.com/noobpk/frida-android-hook
1. cd frida-android-hook/
1. Start Frida-server: `python3 hook.py --fs-start`
1. ```python3 hook.py -p <package> -s <script>```

If you run the script but it doesn't work, you can try the following:
```frida -U -f package -l script.js```




