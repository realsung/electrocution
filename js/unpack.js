const exec = require("child_process");

const arr = process.argv[2].split('/');
const app = "./asar_unpack/" + arr[arr.length - 1].split('.')[0];

var npm_install = exec.spawn('npx.cmd', ['asar','extract', process.argv[2], app]);

npm_install.stdout.on("end", (err, data) => {
    if (err) throw err;
    console.log(`"npx asar extract ${process.argv[2]} ${app}" Success`);
});