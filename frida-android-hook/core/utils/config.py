import os
import sys
import json
from shutil import which
import shlex
import subprocess
from utils.log import *

APP_AUTHOR = ''
APP_VERSION = ''
APP_PLATFORM_SUPPORT = ''
APP_FIRST_RUN = ''
APP_PACKAGES = ''
APP_CONFIG = 'core/hook.json'

class config():

    def loadConfig():

        global APP_VERSION, APP_AUTHOR, APP_PLATFORM_SUPPORT, APP_FIRST_RUN, APP_PACKAGES

        try:
            if os.path.isfile(APP_CONFIG):
                with open(APP_CONFIG, 'r') as f:
                    data = f.read()

                obj = json.loads(data)

                APP_AUTHOR = obj['author']
                APP_VERSION = obj['version']
                APP_CLI_VERSION = obj['cliVersion']
                APP_METHODS = obj['methods']
                APP_UTILS = obj['utils']
                APP_PLATFORM_SUPPORT = obj['platformSupport']
                APP_FIRST_RUN = obj['firstRun']
                APP_PACKAGES = obj['packages']
                APP_FRIDA_SCRIPTS = obj['fridaScripts']
                return {
                    "version" : APP_VERSION,
                    "cliVersion": APP_CLI_VERSION,
                    "author": APP_AUTHOR,
                    "methods": APP_METHODS,
                    "utils": APP_UTILS,
                    "platformSupport": APP_PLATFORM_SUPPORT,
                    "firstRun": APP_FIRST_RUN,
                    "packages": APP_PACKAGES,
                    "fridaScripts": APP_FRIDA_SCRIPTS
                }
            else:
                logger.error('Configuration File Not Found.')
        except Exception as e:
            logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

    def loadBanner():
        print ('''\033[1;31m \n
                                _           _     _   _    _             _    
                /\             | |         (_)   | | | |  | |           | |   
               /  \   _ __   __| |_ __ ___  _  __| | | |__| | ___   ___ | | __
              / /\ \ | '_ \ / _` | '__/ _ \| |/ _` | |  __  |/ _ \ / _ \| |/ /
             / ____ \| | | | (_| | | | (_) | | (_| | | |  | | (_) | (_) |   < 
            /_/    \_\_| |_|\__,_|_|  \___/|_|\__,_| |_|  |_|\___/ \___/|_|\_\\\t
                        https://noobpk.github.io          #noobboy
                    Trace Class/Func & Modify Return Value
            ''')

        print ("\033[1;34m[*]___author___: @" + APP_AUTHOR + "\033[1;37m")
        print ("\033[1;34m[*]___version___: " + APP_VERSION + "\033[1;37m")
        print ("")

config.loadConfig()
config.loadBanner()

class check():

    def initLoad():
        try:
            if APP_FIRST_RUN == True:
                logger.info("[*] This is the first time you are running AndroidHook. We are need install some package.")
                if sys.platform == 'darwin':
                    for name, cmd in APP_PACKAGES['darwin'].items():
                        logger.info("[*] Install " + name)
                        cmd = shlex.split("brew install " + cmd)
                        subprocess.call(cmd)
                elif sys.platform == 'linux':
                    for name, cmd in APP_PACKAGES['linux'].items():
                        logger.info("[*] Install " + name)
                        cmd = shlex.split("sudo apt-get install " + cmd)
                        subprocess.call(cmd)
                elif sys.platform == 'windows':
                    for name, cmd in APP_PACKAGES['windows'].items():
                        logger.warning("[*] You are running AndroidHook on Windows. Please download " + name + " at " + cmd + " then set system variable.!!")

                with open(APP_CONFIG, "r") as f:
                    data = json.load(f)
                    data['firstRun'] = False

                with open(APP_CONFIG, "w") as f:
                    f.write(json.dumps(data, sort_keys=False, indent=4))

        except Exception as e:
            logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

    def platform():
        try:
            if sys.platform not in APP_PLATFORM_SUPPORT:
                sys.exit(logger.error("[x_x] Your platform currently does not support."))
        except Exception as e:
            logger.error("[x_x] Something went wrong, please check your error message.\n Message - {0}".format(e))

check.initLoad()
check.platform()