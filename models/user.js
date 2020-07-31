const mongodb = require("mongodb");
const getDB = require("../util/database").getDB;

const ObjectId = mongodb.ObjectId;

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDB();
    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    // - check to see if product is already in cart
    // - find index of item we want to add
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      return cp.productId.toString() === product._id.toString();
    });
    // - set new qty and updatedCart
    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];
    // - if product index is a positive number, we set the qty and
    if (cartProductIndex >= 0) {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDB();
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  // - currently, when we delete a product from our db, it does not update users cart items to reflect that change, max isnt going to worry about this issue but a good strategy would be to create a check when getting cart, to see if the items retrieved from the cart match the products in the db, and if not we would update the cart items to remove any non existing products.
  getCart() {
    const db = getDB();
    const productIds = this.cart.items.map((item) => {
      return item.productId;
    });
    return db
      .collection("products")
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((product) => {
          return {
            ...product,
            quantity: this.cart.items.find((item) => {
              return item.productId.toString() === product._id.toString();
            }).quantity,
          };
        });
      });
  }

  deleteItemFromCart(productId) {
    const db = getDB();
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    return db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: { items: updatedCartItems } } }
      );
  }

  addOrder() {
    const db = getDB();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          },
        };
        return db.collection("orders").insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection("users")
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: { items: [] } } }
          );
      });
  }

  getOrders() {
    const db = getDB();
    return (
      db
        .collection("orders")
        // adding a filter by creating a direct path to the value we want to compare: user > user.id
        .find({ "user._id": new ObjectId(this._id) })
        .toArray()
    );
  }

  static findById(prodId) {
    const db = getDB();
    return (
      db
        .collection("users")
        // - alternative way to do this, findOne automatically returns one and there for we dont need to call next()
        // .find({ _id: new ObjectId(prodId) })
        // .next();
        .findOne({ _id: new ObjectId(prodId) })
    );
  }
}

module.exports = User;
