# android_app_package_name=$(cat AndroidManifest.xml | grep -o "package=.*" | cut -d'"' -f 2)
# deeplink_scheme_array[0]=$(cat AndroidManifest.xml | grep -o "android:scheme=.*" | cut -d'"' -f 2)
# deeplink_host_array[0]=$(cat AndroidManifest.xml | grep -o "android:host=.*" | cut -d'"' -f 2)
# deeplink_pathPattern_array[0]=$(cat AndroidManifest.xml | grep -o "android:pathPattern=.*" | cut -d'"' -f 2)
# exported_activities_enum[0]=$(cat AndroidManifest.xml | grep -Ei 'exported="true"' | grep -o "android:name=.*" | cut -d'"' -f 2)
# exported_content_providers_enum[0]=$(cat AndroidManifest.xml | grep -o "android:authorities=.*" | cut -d'"' -f 2)

import re
import subprocess
import time
# import pyradamsa

def run_win_cmd(cmd):
    result = []
    process = subprocess.Popen(cmd,
                               shell=True,
                               stdout=subprocess.PIPE,
                               stderr=subprocess.PIPE)
    for line in process.stdout:
        result.append(line)
    errcode = process.returncode
    for line in result:
        print(line.replace(b'\n', b'').decode('utf-8'))
    if errcode is not None:
        raise Exception('cmd %s failed, see above for details', cmd)

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

def main():
    run_win_cmd("""adb connect 127.0.0.1:62001""")
    string = get_fileContent('AndroidManifest.xml')

    package_name = regex(r"package=.*", string, '"')
    scheme = regex(r"android:scheme=.*", string, '"')
    host = regex(r'android:host=.*"', string, '"')
    path = regex(r'android:path=.*', string, '"')
    activities = regex(r'android:name=.*', string, '"')
    content_providers = regex(r'android:authorities=.*', string, '"')

    deeplink_fuzzing(scheme)

def deeplink_fuzzing(deeplink_scheme):
    fuzz_string='NABOMHALANG'
    for i in deeplink_scheme:
        time.sleep(10)
        print("=============================================================")
        print(f""" Command: adb shell "am start -W -a android.intent.action.VIEW -d '{i}://{fuzz_string}'" """)
        run_win_cmd(f""" adb shell "am start -W -a android.intent.action.VIEW -d '{i}://{fuzz_string}'" """)


if __name__ == '__main__':
    main()