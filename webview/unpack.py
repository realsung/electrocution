import os
import sys

def unpack(apk):
    dir = apk[:-4]
    print(f"java -jar tools/apktool_2.7.0.jar d {apk} -f -o public/{dir}")
    os.system(f"java -jar tools/apktool_2.7.0.jar d {apk} -f -o public/{dir}")

def main():
    try:
        print(unpack(sys.argv[1]) + " Done")
    except:
        print('help : python unpack.py <.apk file path>')

if __name__ == '__main__':
    main()