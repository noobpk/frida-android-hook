#!/usr/bin/python3
import sys
import os
setup = """#!/usr/bin/python3

import os
import subprocess
import shlex
import sys
from shutil import which

try:
    if(which('python3') is not None):
        command = shlex.split("python3 " +"core/hook.py")
    else:
        command = shlex.split("python " +"core/hook.py")

    command.extend(sys.argv[1:])
    subprocess.call(command, cwd=os.path.dirname(__file__))

except Exception as e:
    raise e
"""""
    
def _buildBinary():
    try:
        if sys.platform == 'darwin':
            with open('frida-android-hook/androidhook','w+', encoding="utf-8") as f:
                f.write(setup)
            os.system('chmod +x frida-android-hook/androidhook')
            print("[+] Build executable for Darwin success.")
        elif sys.platform == 'linux':
            with open('frida-android-hook/androidhook','w+', encoding="utf-8") as f:
                f.write(setup)
            os.system('chmod +x frida-android-hook/androidhook')
            print("[+] Build executable for Linux success.")
        elif sys.platform == 'win32':
            with open('frida-android-hook/androidhook.py','w+', encoding="utf-8") as f:
                f.write(setup)
            print("[+] Build executable for Windows success.")
    except Exception as e:
        raise e

if __name__ == '__main__':
    if sys.version_info < (3, 0):
        print("[x_x] Android hook requires Python 3.x")
        sys.exit(0)
    else:
        _buildBinary()