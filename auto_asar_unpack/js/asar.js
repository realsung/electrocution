const exec = require("child_process");

var npm_install = exec.spawn('npm.cmd', ['install','asar', '-g']);

npm_install.stdout.on("end", (err, data) => {
    if (err) throw err;
    console.log('"npm install asar -g" Success');
});