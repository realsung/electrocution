from nodejs import node, npm, npx
import os
import shutil

def createFolder(dir: str) -> None:
    try:
        if not os.path.exists(dir):
            os.makedirs(dir)
    except OSError:
        print(f"Error : Create directory. {dir}")

def main():
    path = "C:\\Users\\nabom\\AppData\\Local\\"
    node.call(['./js/asar.js'])

    createFolder('./asar')
    createFolder('./asar_unpack')

    for (root, dirs, files) in os.walk(path):
        for file in files:
            if os.path.splitext(file)[1].lower() == ".asar":
                if "Programs" in root:
                    app = (root.split('Local')[-1].split("\\")[2])
                else:
                    app = (root.split('Local')[-1].split("\\")[1])
                
                print(f'"{app}" asar file : {file}')

                shutil.copyfile(f'{root}\\{file}', f'./asar/{app}_{file}')
                node.run(['./js/unpack.js', f'./asar/{app}_{file}'])

if __name__ == '__main__':
    main()