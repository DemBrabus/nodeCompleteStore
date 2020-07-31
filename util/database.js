const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (cb) => {
  MongoClient.connect(
    "mongodb+srv://nodeCompleteApp:3AVivzO9m3KWETy2@project-node-complete.k3tfh.mongodb.net/project-node-complete?retryWrites=true&w=majority",
    { useUnifiedTopology: true }
  )
    .then((client) => {
      console.log("connected!");
      _db = client.db();
      cb();
    })
    .catch((err) => {
      console.log("connection failed");
      console.log(err);
      throw err;
    });
};

const getDB = () => {
  if (_db) {
    return _db;
  }
  throw "No Database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDB = getDB;
