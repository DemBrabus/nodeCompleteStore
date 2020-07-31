const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");
const mongoConnect = require("./util/database").mongoConnect;

const User = require("./models/user");

// - App
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

// middleware - is ran on every request to our server
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// - this is so that we have access to the user through the entire app, also we are storing a sequelize object that has all of its helper methods like: "destroy, create, etc"
app.use((req, res, next) => {
  User.findById("5f1590641ae74563f07cb2f0")
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

// routes
app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoConnect(() => {
  app.listen(3000);
});
