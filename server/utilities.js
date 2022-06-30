const fs = require("fs");
const { exit } = require("process");

// Create the DB file if it doesn't exist
if (!fs.existsSync("db.json"))
  fs.writeFile("db.json", '{"users": []}', (err) => {
    if (err) exit(1);
    console.log("File db.json created");
  });

// Promise-based writing of a file
fs.writeFileSync = function (filename, content) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(filename, content, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

// Promise-based reading of a file
fs.readFileAsync = function (filename) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filename, function (err, data) {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

module.exports = fs;