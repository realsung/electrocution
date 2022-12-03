import re
import subprocess
import time
import os
from simple_chalk import chalk
# import pyradamsa

def run_win_cmd(cmd) -> subprocess.Popen:
    result = []
    process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    for line in process.stdout:
        result.append(line)
    errcode = process.returncode
    for line in result:
        message = line.replace(b'\n', b'').decode('utf-8')
        if "Complete" in message:
            print(chalk.bold(chalk.green(message)))
        elif "already connected" in message:
            print(chalk.red(message))
        elif "connected" in message:
            print(chalk.bold(chalk.green(message)))
        else:
            print(chalk.gray(message))
    if errcode is not None:
        raise Exception(chalk.red('cmd %s failed, see above for details'), cmd)

def deduplication(List) -> list:
    return list(set(List))

def list2list(List, pattern) -> list:
    li = list()
    for scheme in List:
        li.append(scheme.split(f'{pattern}')[1])
    return deduplication(li)

def get_fileContent(filename) -> str:
    s = ""
    with open(filename, "r", encoding='UTF-8') as f:
        for line in f:
            s += line
    return s

def regex(pattern, string, split) -> list:
    repatter = re.compile(pattern)
    matchOB = repatter.findall(string)
    if matchOB:
        return list2list(matchOB, split)


def deeplink_fuzzing(deeplink_scheme) -> None:
    for scheme in deeplink_scheme:
        time.sleep(0.5)
        os.system("adb shell am start -W -a android.intent.action.VIEW -c android.intent.category.BROWSABLE -d " + scheme)
        time.sleep(3)
        os.system("adb shell input keyevent 3")
        time.sleep(0.5)
        os.system("adb shell input keyevent KEYCODE_HOME")

def main() -> None:
    for (root, dirs, files) in os.walk('public'):
        for file in files:
            if file == "AndroidManifest.xml" and not "origin" in root:
                # run_win_cmd("""adb connect 127.0.0.1:62001""")
                _path = (f'{root}\{file}')
                print(_path)
                string = get_fileContent(_path)

                package_name = regex(r"package=.*", string, '"')
                scheme = regex(r"android:scheme=.*", string, '"')
                host = regex(r'android:host=.*"', string, '"')
                path = regex(r'android:path=.*', string, '"')
                activities = regex(r'android:name=.*', string, '"')
                content_providers = regex(r'android:authorities=.*', string, '"')
                print(package_name, scheme, host, path,)
                # deeplink_fuzzing(scheme)

if __name__ == '__main__':
    main()