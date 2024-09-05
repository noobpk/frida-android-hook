import frida
import time
import os
import sys
import optparse
import subprocess
import re
import fnmatch
import shlex

from utils.listapp import *
from utils.checkversion import *
from utils.log import *
from utils.config import *
from utils.cli import *
from utils.suggestion import *

GLOBAL_CONFIG = config.loadConfig()

APP_FRIDA_SCRIPTS = GLOBAL_CONFIG['fridaScripts']
APP_METHODS = GLOBAL_CONFIG['methods']
APP_UTILS = GLOBAL_CONFIG['utils']

def start_frida_server(param_1):
    fs = "/data/local/tmp/frida-server*"
    isFs = os.system('adb shell ls ' + fs +' 2> /dev/null')
    if (isFs == 0 | isFs == 256):
        print("\033[1;31m[-] Frida Server Not Found!!\033[1;31m")
    else:
        fsName = os.popen('adb shell ls ' + fs + '|' + param_1).read()
        logger.info('[*] Found Frida Server: '+ fsName)
        isProc = os.popen('adb shell ps |' + param_1).read()
        if (isProc):
            logger.warning("[!] Frida Server Is Running")
        else:
            logger.info("[*] Start Frida Server...")
            os.system('adb shell chmod +x ' + fs)
            os.system('adb shell ' + 'su -c ' + fs + ' &')
            time.sleep(2)
            isProc = os.popen('adb shell ps |' + param_1).read()
            if (isProc):
                logger.info("[*] Frida Server Start Success!!")
            else:
                logger.error("[-] Frida Server Start Failed!! Check & Try Again")

def stop_frida_server(param):
    fs = "/data/local/tmp/frida-server*"
    
    # Check if the Frida server process is running
    isProc = subprocess.getoutput(f'adb shell ps | {param}')
    
    if isProc:
        logger.info("[*] Found Process Frida Server: " + isProc)
        logger.info("[*] Stop Frida Server...")

        # Try to stop the Frida server with su privilege
        result = subprocess.run(f'adb shell su -c "pkill -f {fs}"', shell=True)
        
        # Check if the su command was successful
        if result.returncode != 0:
            logger.error("[!] Failed to stop Frida Server with su -c")
            # Retry without su
            logger.info("[*] Try to stop Frida Server withou su...")
            result = subprocess.run(f'adb shell pkill -f {fs}', shell=True)
            
            if result.returncode != 0:
                logger.error("[!] Failed to stop Frida Server")
                return
        
        time.sleep(2)
        logger.info("[*] Stop Frida Server Success!!")
    else:
        logger.warning("[!] Frida Server Not Started")

def check_frida_server_run(param):
    isProc = os.popen('adb shell ps |' + param).read()
    if (isProc):
        return True
    else:
        logger.warning("[!] Frida Server Not Start")
        sys.exit(0)

def dump_memory(option, process):
    try:
        util = APP_UTILS['Dump Memory']
        if option != "-h":
            cmd = shlex.split("python3 " + util + ' ' + "-u" + ' ' + option + ' ' + '"' + process + '"')
        else:
            cmd = shlex.split("python3 " + util + ' ' + option)
        subprocess.call(cmd)
        sys.exit(0)
    except Exception as e:
        logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

def main():
    try:

        usage = '''
        [>] ./androidhook %prog [options] arg
        Example for spawn or attach app with -s(--script) options:
        [>] ./androidhook -p com.android.calendar / [-n 'Calendar'] -s trace_class.js
        Example for spawn or attach app with -m(--method) options:
        [>] ./androidhook -p com.android.calendar / [-n 'Calendar'] -m app-static'''

        parser = optparse.OptionParser(usage,add_help_option=False)
        info = optparse.OptionGroup(parser,"Information")
        quick = optparse.OptionGroup(parser,"Quick Method")

        parser.add_option('-h', "--help", action="help", dest="help", help='''Show basic help message and exit''')
        parser.add_option("--cli", action="store_true", dest="cli", help='''AndroidHook command line interface''')
        #Using options -p(--package) for spawn application and load script
        parser.add_option("-p", "--package", dest="package",
                        help='''Identifier of the target app''', metavar="PACKAGE", action="store", type="string")
        #Using options -n(--name) for attach script to application is running
        parser.add_option("-n", "--name", dest="name",
                        help='''Name of the target app''', metavar="NAME", action="store", type="string")

        parser.add_option("-s", "--script", dest="script",
                        help='''Frida Script Hooking''', metavar="SCIPRT.JS")

        parser.add_option("-c", "--check-version", action="store_true", help='''Check AndroidHook for the newest version''', dest="checkversion")
        parser.add_option("-u", "--update", action="store_true", help='''Update AndroidHook to the newest version''', dest="update")

        parser.add_option("--dump-memory", action="store", help='''Dump memory of application''', dest="dumpmemory")
        
        quick.add_option("-m", "--method", dest="method", type="choice", choices=['bypass-root','bypass-ssl','i-nw-req','i-crypto'],
                        help='''bypass-root: Bypass Root Detection(-p)
                        bypass-ssl: Bypass SSL Pinning(-p)
                        i-nw-req: Intercept NetworkRequest in App(-p)
                        i-crypto: Intercept Crypto in App(-p)''', metavar="METHOD")

        info.add_option("--fs-install",
                        action="store", help="Install frida server", dest="installfrida", type="string")
        info.add_option("--fs-start",
                        action="store_true", help="Start frida server", dest="startfs")
        info.add_option("--fs-stop",
                        action="store_true", help="Stop frida server", dest="stopfs")
        info.add_option("--list-devices",
                        action="store_true", help="List All Devices", dest="listdevices")
        info.add_option("--list-apps",
                        action="store_true", help="List the installed apps", dest="listapp") 
        info.add_option("--list-scripts",
                        action="store_true", help="List All Scripts", dest="listscripts")
        info.add_option("--logcat", action="store_true", help="Show system log of device", dest="logcat")
        info.add_option("--shell", action="store_true", help="Get the shell of connect device", dest="shell")
        info.add_option("--proxy", action="store_true", help="Config global proxy ::3128 and reverse tcp 3128:8080", dest="proxy")

        parser.add_option_group(info)
        parser.add_option_group(quick)

        options, args = parser.parse_args()
        
        if options.listdevices:
            logger.info('[*] List All Devices: ')
            os.system('frida-ls-devices')

        elif options.listscripts:
            path = APP_FRIDA_SCRIPTS
            description_pattern = " * Description:"
            mode_pattern = " * Mode:"
            version_pattern = " * Version:"

            if os.path.exists(path):
                logger.info('[*] List All Scripts: ')
                print("# Frida scripts for Android app testing")
                print(" ")
                files = os.listdir(path)
                sorted_files =  sorted(files)
                i = 0
                for file_name in sorted_files:
                    if fnmatch.fnmatch(file_name, '*.js'):
                        i +=1
                        f = open(path+file_name, "r")
                        for line in f:
                            if re.search(description_pattern, line):
                                description = re.sub(r'\n', '', line[16:])
                            if re.search(mode_pattern, line):
                                mode = re.sub(r'\s+', '', line[9:])
                            if re.search(version_pattern, line):
                                version = re.sub(r'\s+', '', line[12:])  
                        print('|%d|%s|%s|%s|%s|' % (i, mode, file_name, description, version))
            else:
                logger.error('[?] Path frida-script not exists!')

        elif options.installfrida:
            logger.info("[+] Installing Frida Server...")
            if os.path.isfile(options.installfrida):
               os.system('adb push ' + options.installfrida +' /data/local/tmp')
               logger.info("[+] Install Frida Server Success!!")
            else:
               logger.error('[?] Frida Server not found!')

        elif options.startfs:
            get_usb_iphone()
            if sys.platform == "win32":
                start_frida_server('FIND /I "frida-server"')
            else:
                start_frida_server('grep frida-server')          

        elif options.stopfs:
            get_usb_iphone()
            if sys.platform == "win32":
                stop_frida_server('FIND /I "frida-server"')
            else:
                stop_frida_server('grep frida-server')

        elif options.listapp:
            if sys.platform == "win32":
                check_frida_server_run('FIND /I "frida-server"')
            else:
                check_frida_server_run('grep frida-server')
            device = get_usb_iphone()
            list_applications(device)

        #Attaching script to application
        elif options.name and options.script:
            if not os.path.isfile(options.script):
                logger.warning('[!] Script '+options.script+' not found. Try suggestion in frida-script!')
                findingScript = suggestion_script(options.script)
                if (findingScript == False):
                    logger.error('[x_x] No matching suggestions!')
                    sys.exit(0)
                logger.info('[*] androidhook suggestion use '+findingScript)
                answer = input('[?] Do you want continue? (y/n): ') or "y"
                if answer == "y": 
                    options.script =  APP_FRIDA_SCRIPTS + findingScript
                elif answer == "n": 
                    sys.exit(0)
                else: 
                    logger.error('[x_x] Nothing done. Please try again!')
                    sys.exit(0)
            if os.path.isfile(options.script):
                logger.info('[*] Attaching: ' + options.name)
                logger.info('[*] Script: ' + options.script)
                time.sleep(2)
                process = frida.get_usb_device().attach(options.name)
                hook = open(options.script, 'r')
                script = process.create_script(hook.read())
                script.load()
                sys.stdin.read()
            else:
                logger.error('[?] Script not found!')

        #Spawning application and load script
        elif options.package and options.script:
            if not os.path.isfile(options.script):
                logger.warning('[!] Script '+options.script+' not found. Try suggestion in frida-script!')
                findingScript = suggestion_script(options.script)
                if (findingScript == False):
                    logger.error('[x_x] No matching suggestions!')
                    sys.exit(0)
                logger.info('[*] androidhook suggestion use '+findingScript)
                answer = input('[?] Do you want continue? (y/n): ') or "y"
                if answer == "y": 
                    options.script =  APP_FRIDA_SCRIPTS + findingScript
                elif answer == "n": 
                    sys.exit(0)
                else: 
                    logger.error('[x_x] Nothing done. Please try again!')
                    sys.exit(0)
            if os.path.isfile(options.script):
                logger.info('[*] Spawning: ' + options.package)
                logger.info('[*] Script: ' + options.script)
                time.sleep(2)
                pid = frida.get_usb_device().spawn(options.package)
                session = frida.get_usb_device().attach(pid)
                hook = open(options.script, 'r')
                script = session.create_script(hook.read())
                script.load()
                frida.get_usb_device().resume(pid)
                sys.stdin.read()
            else:
                logger.error('[?] Script not found!')

        #Bypass jailbreak
        elif options.package and options.method == "bypass-root":
            method = APP_METHODS['Bypass Root Detection']
            if os.path.isfile(method):
                logger.info('[*] Bypass Root: ')
                logger.info('[*] Spawning: ' + options.package)
                logger.info('[*] Script: ' + method)
                time.sleep(2)
                pid = frida.get_usb_device().spawn(options.package)
                session = frida.get_usb_device().attach(pid)
                hook = open(method, 'r')
                script = session.create_script(hook.read())
                script.load()
                frida.get_usb_device().resume(pid)
                sys.stdin.read()
            else:
                logger.error('[x_x] Script for method not found!')

        #Bypass SSL Pinning
        elif options.package and options.method == "bypass-ssl":
            method = APP_METHODS['Bypass SSL Pinning']
            if os.path.isfile(method):
                logger.info('[*] Bypass SSL Pinning: ')
                logger.info('[*] Spawning: ' + options.package)
                logger.info('[*] Script: ' + method)
                time.sleep(2)
                pid = frida.get_usb_device().spawn(options.package)
                session = frida.get_usb_device().attach(pid)
                hook = open(method, 'r')
                script = session.create_script(hook.read())
                script.load()
                frida.get_usb_device().resume(pid)
                sys.stdin.read()
            else:
                logger.error('[x_x] Script for method not found!')

        #Intercept url request in app
        elif options.name and options.method == "i-nw-req":
            method = APP_METHODS['Intercept Network Request']
            if os.path.isfile(method):
                logger.info('[*] Intercept NetWork Request: ')
                logger.info('[*] Attaching: ' + options.name)
                logger.info('[*] Script: ' + method)
                process = frida.get_usb_device().attach(options.name)
                method = open(method, 'r')
                script = process.create_script(method.read())
                script.load()
                sys.stdin.read()
            else:
                logger.error('[x_x] Script for method not found!')

        #Intercept Crypto Operations
        elif options.package and options.method == "i-crypto":
            method = APP_METHODS['Intercept Crypto Operations']
            if os.path.isfile(method):
                logger.info('[*] Intercept Crypto Operations: ')
                logger.info('[*] Spawning: ' + options.package)
                logger.info('[*] Script: ' + method)
                time.sleep(2)
                pid = frida.get_usb_device().spawn(options.package)
                session = frida.get_usb_device().attach(pid)
                hook = open(method, 'r')
                script = session.create_script(hook.read())
                script.load()
                frida.get_usb_device().resume(pid)
                sys.stdin.read()
            else:
                logger.error('[x_x] Script for method not found!')

        #check newversion
        elif options.checkversion:
            logger.info('[*] Checking for updates...')
            is_newest = check_version(speak=True)
            # if not is_newest:
            #     logger.info('[*] There is an update available for androidhook')

        #update newversion
        elif options.update:
            logger.info('[*] Update in progress...')
            cmd = shlex.split("git pull origin master")
            subprocess.call(cmd)
            sys.exit(0)

        #dump decrypt application
        elif options.package and options.dumpmemory:
            dump_memory(options.dumpmemory, options.package)

        #android system log
        elif options.logcat:
            cmd = shlex.split('adb logcat')
            subprocess.call(cmd)
            sys.exit(0)

        #android get the shell
        elif options.shell:
            cmd = shlex.split('adb shell')
            subprocess.call(cmd)
            sys.exit(0)

        #androidhook cli
        elif options.cli:
            logger.info("Welcome to AndroidHook CLI! Type ? to list commands")
            AndroidHook_CLI().cmdloop()

        #androidhook proxy
        elif options.proxy:
            cmd1 = shlex.split('adb shell settings put global http_proxy 127.0.0.1:3128')
            cmd2 = shlex.split('adb reverse tcp:3128 tcp:8080')

            logger.info("[*] Config device global proxy to ::3128")
            subprocess.call(cmd1)

            logger.info("[*] Config reverse tcp from device to machine 3128:8080")
            subprocess.call(cmd2)

            logger.info("[*] Config success - Using proxy 127.0.0.1:8080")
            sys.exit(0)

        else:
            logger.warning("[!] Specify the options. use (-h) for more help!")
            # sys.exit(0)

    #EXCEPTION FOR FRIDA
    except frida.ServerNotRunningError:
        logger.error("[x_x] Frida server is not running.")
    except frida.TimedOutError:
        logger.error("Timed out while waiting for device to appear.")
    except frida.TransportError:
        logger.error("[x_x] The application may crash or lose connection.")
    except (frida.ProcessNotFoundError,
            frida.InvalidOperationError):
        logger.error("[x_x] Unable to find process with name " + options.name + ". You need run app first.!!")
    #EXCEPTION FOR OPTIONPARSING

    #EXCEPTION FOR SYSTEM
    except Exception as e:
        logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

    except KeyboardInterrupt:
        logger.info("Bye bro!!")
        # sys.exit(0)

def run():
    #check python version
    if sys.version_info < (3, 0):
        logger.error("[x_x] Android hook requires Python 3.x")
        sys.exit(1)
    else:
        deleteLog()
        main()

if __name__ == '__main__':
    run()

    