<img width="544" alt="image" src="https://user-images.githubusercontent.com/31820707/108661418-60d4b500-74fe-11eb-81ed-c164df9ef4a5.png">

# Frida Android hook
📍 A tool that helps you can easy using frida. It support script for trace classes, functions, and modify the return values of methods on iOS platform.

👉 For iOS platform: [frida-ios-hook](https://github.com/noobpk/frida-ios-hook)

## Env OS Support
| OS      | Supported          | Noted   |
| ------- | ------------------ | ------- |
| MacOS   | :white_check_mark: | main	 |
| Linux   | :white_check_mark: | sub  	 |
| Windows | :white_check_mark: | sub	 |

## Compatible with
| Android Api   |  Frida   | Supported         |
| ------------- | ---------| ----------------- |
|  8.0 - Api 26 | 14.2.13  | :white_check_mark:|
|  8.0 - Api 26 | 15.0.18  | :white_check_mark:|

## Feature

Running with python3.x

Support both spawn & attach script to process.

```
[+] Options:

	-p(--package)			Identifier of application ex: com.android.calendar
	-n(--name) 				Name of application ex: Calendar
	-s(--script) 			Using script format script.js
	-c(--check-version) 	Check for the newest version
	-u(--upadte) 			Update to the newest version
	
	[*] Dump memory aplication:
	
    	--dump-memory         Dump memory of application

	[*] Information:

	--fs-install		Install frida server
	--fs-start          Start frida server
    --fs-stop           Stop frida server
    --list-devices      List All Devices
    --list-apps         List the installed apps
    --list-scripts      List All Scripts
    --logcat            Show system log of device
    --shell             Get the shell of connect device

	[*] Quick method:

	-m(--method)		Support commonly used methods
							app-static(-n)
							bypass-jb(-p)
							bypass-ssl(-p)
							i-url-req(-p)
							i-crypto(-n)
```

## Update

[Version: 1.2]

	[+] Feature: Dump memory application

## Install & Usage

```
1. Git clone https://github.com/noobpk/frida-android-hook
2. cd frida-android-hook/
3. chmod +x androidhook
4. Start Frida-server: `./androidhook --fs-start`
5. ./androidhook --help(-h)
6. rebellion :))

```

If you run the script but it doesn't work, you can try the following:
```frida -U -f package -l script.js```

## 📺 Demo Feature


## Disclaimer
Because I am not a developer, so my coding skills might not be the best. Therefore, if this tool have any issue or not working for you, create an issue and i will try to fix it.
Any suggestions for new feature and discussions are welcome!


