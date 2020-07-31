const Product = require("../models/product");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectId;

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Products",
    path: "/admin/add-product",
    editing: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const id = null;
  const title = req.body.title;
  const image = req.body.imageURL;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(
    title,
    price,
    description,
    image,
    null,
    req.user._id
  );
  product
    .save()
    .then((results) => {
      // console.log(results);
      console.log("Created Product");
    })
    .then((results) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      alert(err);
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        res.redirect("/admin/products");
      } else {
        res.render("admin/edit-product", {
          pageTitle: "Edit Products",
          path: "/admin/edit-product",
          editing: editMode,
          product: product,
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageURL;
  const updatedDescription = req.body.description;

  const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedDescription,
    updatedImageUrl,
    new ObjectId(prodId)
  );
  product
    .save()
    .then((results) => {
      console.log("updated Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      alert("Error editing product");
      res.redirect("/admin/products");
    });
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteById(prodId)
    .then((results) => {
      console.log("Product Deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      alert("Error Deleting Product");
      res.redirect("/admin/products");
    });
};
