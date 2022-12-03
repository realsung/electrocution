import os
import sys
import json
from collections import OrderedDict

global config

def ParseFile(file):
    global config

    fileName, fileExtension = os.path.splitext(file)
    if(fileExtension != ".smali"):
        return [], [], ""

    #print(file)

    f = open(file, "r", encoding="utf-8")

    dic = {}
    params = list()
    jsinterfaces = {}
    webviewclass = ""
    className = ""
    methodName = ""

    while True:
        line = f.readline()
        if not line: break

        line = line.replace('\n', '')

        words = line.split(" ")
        if words[0] == ".class":
            className = line
        elif words[0] == ".method":
            methodName = line

        if ".annotation" in line:
            for annotation in config["static"]["annotation"]:
                if annotation in line:
                    if len(jsinterfaces) == 0:
                        jsinterfaces['activity'] = 'Activity'
                        jsinterfaces['class'] = className
                        jsinterfaces['methods'] = list()
                    jsinterfaces['methods'].append(methodName)

        for searchString in config["static"]["string"]:
            if searchString in line:
                webviewclass = className

        if "const-string" in line:
            for i in range(0, len(words)):
                if(words[i] == "const-string"):
                    dic[words[i+1][:-1]] = (words[i+2]).replace('\"', '')
                    break
        elif "getQueryParameter(" in line:
            for word in words:
                if "}" in word:
                    key = word[:-2]
                    if key in dic.keys():
                        params.append(dic[key]) # + " : " + className)
                        break

    f.close()
    return params, jsinterfaces, webviewclass

def Parse(dir):
    global config
    pwd = dir

    params = list()
    jsinterfaces = list()
    webviewclasses = list()
    result = {}

    config = dict()

    with open("config.json", "r") as read_json:
        config = json.load(read_json)

    for path, dirs, files in os.walk(f'public/{pwd}'):
        for file in files:
            ptmp, jtmp, wtmp = ParseFile(os.path.join(path, file))
            params += ptmp
            if len(jtmp) != 0:
                jsinterfaces.append(jtmp)
            if wtmp != "":
                webviewclasses.append(wtmp)

    result["Parameter"] = list(set(params))
    result["JavascriptInterface"] = jsinterfaces
    result["WebviewClass"] = webviewclasses
    return result
            
if __name__ == "__main__":
    for dir in os.listdir('public'):
            print(Parse(dir))
