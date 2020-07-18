const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const sequelize = require("./util/database");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const orderItem = require("./models/order-item");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

const errorController = require("./controllers/error");

// - App
const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

// middleware - is ran on every request to our server
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// - this is so that we have access to the user through the entire app, also we are storing a sequelize object that has all of its helper methods like: "destroy, create, etc"
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      req.user = user;
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

// sequelize associates
// - connects a product to a user in the sense that a user created a product
Product.belongsTo(User, {
  constraints: true,
  onDelete: "CASCADE",
});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
// - says that Cart and Product are connected through a intermediary table CartItem
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: orderItem });

sequelize
  // - "force:true" ensures that a new products table is created with the relations we defined above
  // .sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      User.create({ name: "Dan", email: "dmdm@gmial.com" });
    }
    return user;
  })
  .then((user) => {
    return user.createCart();
  })
  .then((cart) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
