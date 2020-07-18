const Product = require("../models/product");

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
  // - bc we defined a connection/relation in app.js to Users and Products, Sequelize will automatically create a method that allows you to create an associated table User -> Product
  req.user
    .createProduct({
      title: title,
      price: price,
      imageUrl: image,
      description: description,
    })
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
  req.user
    .getProducts({ where: { id: prodId } })
    .then((products) => {
      const product = products[0];
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
  Product.findByPk(prodId)
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.imageURL = updatedImageUrl;
      product.description = updatedDescription;
      return product.save();
    })
    .then((results) => {
      console.log("updated Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      alert("Error editing product");
      res.redirect("/admin/products");
    });
  const updatedProduct = new Product(
    prodId,
    updatedTitle,
    updatedImageUrl,
    updatedDescription,
    updatedPrice
  );
  updatedProduct.save();
};

exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
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
  Product.findByPk(prodId)
    .then((product) => {
      return product.destroy();
    })
    .then((results) => {
      console.log("Product Deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
      alert("Error Deleting Product");
      res.redirect("/admin/products");
    });
  res.redirect("/admin/products");
};
