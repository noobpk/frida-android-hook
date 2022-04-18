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
            with open('frida-android-hook/androidhook','w+') as f:
                f encoding='utf_8').write(setup)
            os.system('chmod +x frida-android-hook/androidhook')
        elif sys.platform == 'linux':
            with open('frida-android-hook/androidhook','w+') as f:
                f encoding='utf_8').write(setup)
            os.system('chmod +x frida-android-hook/androidhook')
        elif sys.platform == 'win32':
            with open('frida-android-hook/androidhook.py','w+') as f:
                f encoding='utf_8').write(setup)
    except Exception as e:
        raise e

if __name__ == '__main__':
    if sys.version_info < (3, 0):
        print("[x_x] iOS hook requires Python 3.x")
        sys.exit(0)
    else:
        _buildBinary()