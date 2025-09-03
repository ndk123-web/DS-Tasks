const jayson = require("jayson");

const server = new jayson.Server({
  manipulator: function (args, callback) {
    let num = Math.floor(Math.random() * 4 + 1);
    callback(null, num);
  },
});

server.http().listen(3000);
console.log("✅ JSON-RPC server listening on port 3000");