import xml.etree.ElementTree as ElementTree
import sys
import os
from collections import OrderedDict

def searchString(stext, pwd):
    text = stext.split('/')
    text = text[1]
    for path, dirs, files in os.walk(pwd):
        for file in files:
            if(file == "strings.xml"):
                tree = ElementTree.parse(os.path.join(path, file))
                for string in tree.findall("string"):
                    if string.attrib["name"] == text:
                        return string.text
    
    return stext

def xml(apk):
    pwd = apk[:-4]
    AndroidManifest = f"public/{pwd}/AndroidManifest.xml"
    print(AndroidManifest)
    tree = ElementTree.parse(AndroidManifest)
    result = {}
    result_list = list()

    for activity in tree.find('application').findall('activity'):
        for intentFilter in activity.findall('intent-filter'):
            for data in intentFilter.findall('data'):
                url = ""
                if "{http://schemas.android.com/apk/res/android}scheme" in data.attrib.keys():
                    scheme = data.attrib["{http://schemas.android.com/apk/res/android}scheme"]
                    if "@string" in scheme:
                        scheme = searchString(scheme, pwd)
                    url += scheme
                    url += "://"
                    if "{http://schemas.android.com/apk/res/android}host" in data.attrib.keys():
                        host = data.attrib["{http://schemas.android.com/apk/res/android}host"]
                        if "@string" in host:
                            host = searchString(host, pwd)
                        url += host
                    if "{http://schemas.android.com/apk/res/android}path" in data.attrib.keys():
                        path = data.attrib["{http://schemas.android.com/apk/res/android}path"]
                        if "@string" in path:
                            path = searchString(path, pwd)
                        url += path
                    if "{http://schemas.android.com/apk/res/android}pathPattern" in data.attrib.keys():
                        pathPattern = data.attrib["{http://schemas.android.com/apk/res/android}pathPattern"]
                        if "@string" in pathPattern:
                            pathPattern = searchString(pathPattern, pwd)
                        url += pathPattern
                    result_list.append(url)
                """
                output.write(url)
                output.write("\n")
                """
    result["Scheme"] = list(set(result_list))
    return result

if __name__ == "__main__":
    #output = open(sys.argv[2], "w", encoding="utf-8")
    print(xml(sys.argv[1]))
    #output.close()