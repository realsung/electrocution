import re
import subprocess
import time
from simple_chalk import chalk
# import pyradamsa

def run_win_cmd(cmd) -> str:
    result = []
    process = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    for line in process.stdout:
        result.append(line)
    errcode = process.returncode
    for line in result:
        if "Complete" in line.replace(b'\n', b'').decode('utf-8'):
            print(chalk.bold(chalk.green(line.replace(b'\n', b'').decode('utf-8'))))
        elif "already connected" in line.replace(b'\n', b'').decode('utf-8'):
            print(chalk.red(line.replace(b'\n', b'').decode('utf-8')))
        elif "connected" in line.replace(b'\n', b'').decode('utf-8'):
            print(chalk.bold(chalk.green(line.replace(b'\n', b'').decode('utf-8'))))
        else:
            print(chalk.gray(line.replace(b'\n', b'').decode('utf-8')))
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
    fuzz_string='NABOMHALANG'
    for i in deeplink_scheme:
        time.sleep(5)
        print("============================================================================================================================")
        print(chalk.blue(f"""Command: adb shell "am start -W -a android.intent.action.VIEW -d '{i}://{fuzz_string}'" """))
        run_win_cmd(f"""adb shell "am start -W -a android.intent.action.VIEW -d '{i}://{fuzz_string}'" """)

def main() -> None:
    run_win_cmd("""adb connect 127.0.0.1:62001""")
    string = get_fileContent('AndroidManifest.xml')

    package_name = regex(r"package=.*", string, '"')
    scheme = regex(r"android:scheme=.*", string, '"')
    host = regex(r'android:host=.*"', string, '"')
    path = regex(r'android:path=.*', string, '"')
    activities = regex(r'android:name=.*', string, '"')
    content_providers = regex(r'android:authorities=.*', string, '"')

    deeplink_fuzzing(scheme)

if __name__ == '__main__':
    main()