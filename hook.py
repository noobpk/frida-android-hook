import frida
import time
import os
import sys
import optparse
import threading
import codecs
import shutil
import tempfile
import subprocess
import re
import fnmatch
import shlex
import subprocess
import psutil

import paramiko
from paramiko import SSHClient
from scp import SCPClient
from tqdm import tqdm
import traceback
from lib.listapp import *
from lib.checkversion import *
from lib.log import *

print ('''\033[1;31m \n
                    _           _     _   _    _             _    
    /\             | |         (_)   | | | |  | |           | |   
   /  \   _ __   __| |_ __ ___  _  __| | | |__| | ___   ___ | | __
  / /\ \ | '_ \ / _` | '__/ _ \| |/ _` | |  __  |/ _ \ / _ \| |/ /
 / ____ \| | | | (_| | | | (_) | | (_| | | |  | | (_) | (_) |   < 
/_/    \_\_| |_|\__,_|_|  \___/|_|\__,_| |_|  |_|\___/ \___/|_|\_\\\t
    Trace Class/Func & Modify Return Value          #noobteam
''')

print ("\033[1;34m[*]___author___: @noobpk\033[1;37m")
print ("\033[1;34m[*]___version___: 1.2\033[1;37m")
print ("")

def check_platform():
    try:
        platforms = {
        'linux'  : 'Linux',
        'linux1' : 'Linux',
        'linux2' : 'Linux',
        'darwin' : 'OS X',
        'win32'  : 'Windows'
        }
        if sys.platform not in platforms:
            logger.error("[x_x] Your platform currently does not support.")
            sys.exit(0)
    except Exception as e:
        logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

def handle_del_log():
    try:
        pwd = os.getcwd()
        path = pwd + '/errors.log'
        file_stats = os.stat(path)
        if (file_stats.st_size > 1024000000): #delete errors.log if file size > 1024 MB
            os.remove(path)
        else:
            return True
    except Exception as e:
        logger.error("[x_x] Something went wrong when clear error log. Please clear error log manual.\n Message - {0}".format(e))

def check_ps_for_win32():
    try:
        if sys.platform == "win32":
            PROCESSNAME = "iTunes.exe"
            for proc in psutil.process_iter():
                try:
                    if proc.name() == PROCESSNAME:
                        return True
                except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess) as e:
                    pass
            return sys.exit(logger.error("[x_x] Please install iTunes on MicrosoftStore or run iTunes frist."))              
    except Exception as e:
        logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

def run():
    #check platform support
    check_platform()
    #check python version
    if sys.version_info < (3, 0):
        logger.error("[x_x] Android hook requires Python 3.x")
        sys.exit(1)
    else:
        handle_del_log()
        main()

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
            os.system('adb shell ' + fs + ' &')
            time.sleep(2)
            isProc = os.popen('adb shell ps |' + param_1).read()
            if (isProc):
                logger.info("[*] Frida Server Start Success!!")
            else:
                logger.error("[-] Frida Server Start Failed!! Check & Try Again")

def stop_frida_server(param):
    fs = "/data/local/tmp/frida-server*"
    isProc = os.popen('adb shell ps |' + param).read()
    if (isProc):
        logger.info("[*] Found Process Frida Server:" + isProc)
        logger.info("[*] Stop Frida Server...")
        os.system('adb shell pkill -f ' + fs)
        time.sleep(2)
        logger.info("[*] Stop Frida Server Success!!")
    else:
        logger.warning("[!] Frida Server Not Start")

def check_frida_server_run(param):
    isProc = os.popen('adb shell ps |' + param).read()
    if (isProc):
        return True
    else:
        logger.warning("[!] Frida Server Not Start")
        sys.exit(0)

def dump_memory(option, process):
    if option != "-h":
        cmd = shlex.split("python3 " + "lib/dump/fridump.py " + "-U " + option + ' ' +process)
    else:
        cmd = shlex.split("python3 " + "lib/dump/fridump.py " + option)
    subprocess.call(cmd)
    sys.exit(0)

def main():
    try:

        usage = "[>] python3 %prog [options] arg\n\n\r[>] Example for spawn or attach app with -s(--script) options:\npython3 hook.py -p com.android.calendar / [-n 'Calendar'] -s trace_class.js\n\n\r[>] Example for spawn or attach app with -m(--method) options:\npython3 hook.py -p com.android.calendar / [-n 'Calendar'] -m app-static\n\n\r[>] Example dump memory of application with --dump-memory and -s(--string) options:\npython3 hook.py -p com.android.calendar --dump-memory '-s(--string)'"
        parser = optparse.OptionParser(usage,add_help_option=False)
        info = optparse.OptionGroup(parser,"Information")
        quick = optparse.OptionGroup(parser,"Quick Method")

        parser.add_option('-h', "--help", action="help", dest="help", help="Show basic help message and exit")
        #Using options -p(--package) for spawn application and load script
        parser.add_option("-p", "--package", dest="package",
                        help="Identifier of the target app", metavar="PACKAGE", action="store", type="string")
        #Using options -n(--name) for attach script to application is running
        parser.add_option("-n", "--name", dest="name",
                        help="Name of the target app", metavar="NAME", action="store", type="string")

        parser.add_option("-s", "--script", dest="script",
                        help="Frida Script Hooking", metavar="SCIPRT.JS")
        parser.add_option("--dump-memory", action="store", help="Dump memory of application", dest="dumpmemory")
        parser.add_option("-c", "--check-version", action="store_true", help="Check iOS hook for the newest version", dest="checkversion")
        parser.add_option("-u", "--update", action="store_true", help="Update iOS hook to the newest version", dest="update")
        quick.add_option("-m", "--method", dest="method", type="choice", choices=['app-static','bypass-root','bypass-ssl','i-nw-req','i-crypto'],
                        help="__app-static: Static Ananlysis Application(-n)\n\n\r\r__bypass-jb: Bypass Root Detection(-p)\n\n\r\r\r\r\r\r__bypass-ssl: Bypass SSL Pinning(-p)\n\n\n\n\n\n\n\n\n\r\r\r\r\r\r__i-nw-req: Intercept NetworkRequest in App(-p)\n\n\n\n\n\n\n\n\n\r\r\r\r\r\r__i-crypto: Intercept Crypto in App(-p)", metavar="app-static / bypass-root / bypass-ssl / i-nw-req / i-crypto")
        info.add_option("--fs-install",
                        action="store", help="Install frida server", dest="installfrida", type="string")
        info.add_option("--fs-start",
                        action="store_true", help="Start frida server", dest="startfs")
        info.add_option("--fs-stop",
                        action="store_true", help="Stop frida server", dest="stopfs")
        info.add_option("--list-apps",
                        action="store_true", help="List the installed apps", dest="listapp") 

        parser.add_option_group(info)
        parser.add_option_group(quick)

        options, args = parser.parse_args()
        
        methods = [
            "method/_.js", #0
            "method/static_analysis.js", #1
            "method/bypass_ssl.js", #2
            "method/bypass_root.js", #3
            "method/intercept_nw_request.js", #4
            "method/intercept_crypto.js" #5
        ]

        libs = [
            "lib/dump/fridump.py" #0
        ]
        if options.installfrida:
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
            method = methods[3]
            logger.warning('[!] The Method Is Updating!!')
            # if os.path.isfile(method):
            #     logger.info('[*] Bypass Jailbreak: ')
            #     logger.info('[*] Spawning: ' + options.package)
            #     logger.info('[*] Script: ' + method)
            #     time.sleep(2)
            #     pid = frida.get_usb_device().spawn(options.package)
            #     session = frida.get_usb_device().attach(pid)
            #     hook = open(method, 'r')
            #     script = session.create_script(hook.read())
            #     script.load()
            #     frida.get_usb_device().resume(pid)
            #     sys.stdin.read()
            # else:
            #     logger.error('[?] Script for method not found!')

        #Bypass SSL Pinning
        elif options.package and options.method == "bypass-ssl":
            method = methods[2]
            logger.warning('[!] The Method Is Updating!!')
            if os.path.isfile(method):
                logger.info('[*] Bypass SSL Pinning: ')
                logger.info('[*] Spawning: ' + options.package)
                logger.info('[*] Script: ' + method)
                time.sleep(2)
                process = frida.get_usb_device().attach(options.package)
                method = open(method, 'r')
                script = process.create_script(method.read())
                script.load()
                sys.stdin.read()
            else:
                logger.error('[?] Script for method not found!')

        #Intercept url request in app
        elif options.name and options.method == "i-nw-req":
            method = methods[4]
            logger.warning('[!] The Method Is Updating!!')
            if os.path.isfile(method):
                logger.info('[*] Intercept NetWork Request: ')
                logger.info('[*] Attaching: ' + options.name)
                logger.info('[*] Script: ' + method)
                time.sleep(2)
                process = frida.get_usb_device().attach(options.name)
                method = open(method, 'r')
                script = process.create_script(method.read())
                script.load()
                sys.stdin.read()
            else:
                logger.error('[?] Script for method not found!')

        #Intercept Crypto Operations
        elif options.package and options.method == "i-crypto":
            method = methods[5]
            check_frida_server_run()
            if os.path.isfile(method):
                logger.info('[*] Intercept Crypto Operations: ')
                logger.info('[*] Spawning: ' + options.package)
                logger.info('[*] Script: ' + method)
                os.system('frida -U -f '+ options.package + ' -l ' + method + ' --no-pause')
                #sys.stdin.read()
            else:
                logger.error('[?] Script for method not found!')

        #check newversion
        elif options.checkversion:
            logger.info('[*] Checking for updates...')
            is_newest = check_version(speak=True)
            # if not is_newest:
            #     logger.info('[*] There is an update available for iOS hook')

        #update newversion
        elif options.update:
            logger.info('[*] Update in progress...')
            cmd = shlex.split("git pull origin master")
            subprocess.call(cmd)
            sys.exit(0)

        #dump decrypt application
        elif options.package and options.dumpmemory:
            dump_memory(options.dumpmemory, options.package)


        else:
            logger.warning("[!] Specify the options. use (-h) for more help!")
            # sys.exit(0)

    #EXCEPTION FOR FRIDA
    except frida.ServerNotRunningError:
        logger.error("Frida server is not running.")
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

if __name__ == '__main__':
        run()

    