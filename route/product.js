import express from "express";
import multer from "multer";
import fs from "fs";
import jwt from "jsonwebtoken";
import { Sequelize } from "sequelize";
import { db } from "../database/init.js";
import { delayMiddleware } from "../middlewares/delayMiddleware.js";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware.js";
import { Product } from "../database/models/product.js";
import { Seller } from "../database/models/seller.js";
import { Purchase } from "../database/models/purchase.js";
import { PurchaseDetail } from "../database/models/purchaseDetail.js";
import { User } from "../database/models/user.js";
import { ProductReviewNotif } from "../database/models/productReviewNotif.js";
import { ProductReview } from "../database/models/productReview.js";

Product.hasMany(ProductReviewNotif);
ProductReviewNotif.belongsTo(Product);
User.hasMany(ProductReviewNotif);
ProductReviewNotif.belongsTo(User);

const router = express.Router();
const secret = "product";
const productUpload = multer({
  storage: multer.diskStorage({
    destination: "images/product/",
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 10000);
      let filetype = file.originalname.slice(
        file.originalname.lastIndexOf(".")
      );
      cb(null, uniqueSuffix + filetype);
    },
  }),
});

router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Seller,
          attributes: ["name", "id", "image", "email"],
        },
        {
         model: ProductReview,
         attributes: ['rate']
        }
      ],
    });
    return res.json(products);
  } catch (error) {
    console.log("error", error);
    return res.status(500).json(error);
  }
});
router.get("/single/:id", delayMiddleware(200), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, { include: Seller });
    product.Seller.password = null;
    if (!product) {
      return res.status(204).json(null);
    }
    return res.json(product);
  } catch (error) {
    console.log("error", error);
    return res.json(error);
  }
});
router.get("/review/:id", delayMiddleware(1000), async (req, res) => {
  try {
    const reviews = await ProductReview.findAll({
      where: {
        ProductId: req.params.id,
      },
      include: User,
    });
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json(error);
  }
});
router.get("/find-one", verifyTokenMiddleware(secret), async (req, res) => {
  if (req.jwtError) return res.status(401).json(req.jwtError);

  try {
    const product = await product.findByPk(req.token.id);
    return res.json(product);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
});
router.post(
  "/create",
  delayMiddleware(1000),
  verifyTokenMiddleware("seller"),
  productUpload.single("image"),
  async (req, res) => {
    try {
      const newproduct = await Product.create({
        name: req.body.name,
        productname: req.body.productname,
        email: req.body.email,
        password: req.body.password,
        image: req.file.filename,
      });
      const token = jwt.sign({ id: newproduct.id, role: "product" }, secret);
      return res.json({ product: newproduct, token });
    } catch (error) {
      console.log("error", error);
      // hapus image yang udah di upload
      if (req.file) {
        if (fs.existsSync(`./images/product/${req.file.filename}`)) {
          fs.promises
            .unlink(`./images/product/${req.file.filename}`)
            .then((val) => {});
        }
      }
      return res.status(500).json(error);
    }
  }
);
router.post(
  "/login",
  delayMiddleware(1000),
  productUpload.single("image"),
  async (req, res) => {
    try {
      const product = await product.findOne({
        where: {
          email: req.body.email,
          password: req.body.password,
        },
      });
      const token = jwt.sign({ id: product.id, role: "product" }, secret);
      return res.json({ product, token });
    } catch (error) {
      console.log(error);
      return res.status(500).json(500);
    }
  }
);
router.delete(
  "/delete",
  delayMiddleware(1000),
  verifyTokenMiddleware("admin"),
  async (req, res) => {
    if (req.jwtError) return res.status(401).json(req.jwtError);
    try {
      await Product.destroy({
        where: { id: req.body.id },
      });
      const products = await Product.findAll({ include: Seller });
      return res.json(products);
    } catch (error) {
      return res.json(error);
    }
  }
);
router.delete(
  "/truncate",
  delayMiddleware(1000),
  verifyTokenMiddleware("admin"),
  async (req, res) => {
    if (req.jwtError) return res.status(401).json(req.jwtError);

    try {
      await Product.truncate();
      return res.json(true);
    } catch (error) {
      return res.json(error);
    }
  }
);
router.post(
  "/buy-now",
  delayMiddleware(1000),
  verifyTokenMiddleware("user"),
  productUpload.single("image"),
  async (req, res) => {
    if (req.jwtError) return res.status(401).json(req.jwtError);

    req.body.product = JSON.parse(req.body.product);
    try {
      await db.transaction(async (t) => {
        try {
          const product = await Product.update(
            {
              stock: req.body.product.stock - req.body.quantity,
            },
            {
              transaction: t,
              where: {
                id: req.body.product.id,
              },
            }
          );
          const user = await User.findByPk(req.token.id, { transaction: t });
          const purchase = await user.createPurchase(
            {
              totalPrice: req.body.totalPrice,
            },
            { transaction: t }
          );
          const purchaseDetail = await purchase.createPurchaseDetail(
            {
              sellerId: req.body.product.Seller.id,
              sellerName: req.body.product.Seller.name,
              productId: req.body.product.id,
              productName: req.body.product.name,
              productImage: req.body.product.image,
              productPrice: req.body.product.price,
              productQuantity: req.body.quantity,
            },
            { transaction: t }
          );
          const notif = await ProductReviewNotif.create(
            {
              UserId: user.id,
              ProductId: req.body.product.id,
            },
            { transaction: t }
          );
          // const notifs = await ProductReviewNotif.find
          await t.commit();
          return res.json(notif);
        } catch (error) {
          console.log("error inside transaction", error);
          await t.rollback();
          return res.status(500).json(error);
        }
      });
    } catch (error) {
      console.log("error outside db.transaction()", error);
    }
  }
);
router.get("/review-notif", verifyTokenMiddleware("user"), async (req, res) => {
  if (req.jwtError) return res.status(401).json(req.jwtError);
  console.log("req.token.id", req.token.id);
  try {
    const notif = await ProductReviewNotif.findAll({
      where: {
        UserId: req.token.id,
      },
    });
    console.log("notif", notif);
    return res.json(notif);
  } catch (error) {
    console.log("error", error);
    return res.status(500).json(error);
  }
});
router.post(
  "/review",
  delayMiddleware(1000),
  verifyTokenMiddleware("user"),
  productUpload.single("image"),
  async (req, res) => {
    console.log("req.body", req.body);

    // return res.json('ok')
    try {
      await db.transaction(async (t) => {
        try {
          // delete notif
          const notif = await ProductReviewNotif.findByPk(req.body.notifId, {
            transaction: t,
          });
          await notif.destroy({ transaction: t });

          const review = await ProductReview.create(
            {
              review: req.body.review,
              UserId: req.body.userId,
              ProductId: req.body.productId,
              rate: req.body.rate,
            },
            { transaction: t }
          );
          const notifs = await ProductReviewNotif.findAll({
            where: {
              UserId: req.token.id,
            },
            transaction: t,
          });
          t.commit();
          return res.json({ review, notifs });
          // create review
        } catch (error) {
          console.log("error", error);
          t.rollback();
          return res.status(500).json(error);
        }
      });
    } catch (error) {}
  }
);
router.get(
  "/review-notif-list",
  delayMiddleware(1),
  verifyTokenMiddleware("user"),
  async (req, res) => {
    console.log("this is sparta!");
    try {
      const list = await ProductReviewNotif.findAll({
        where: {
          UserId: req.token.id,
        },
        include: [
          {
            model: Product,
            include: { model: Seller, attributes: { exclude: "password" } },
          },
          User,
        ],
      });
      return res.json(list);
    } catch (error) {
      console.log("/review-notif-list error", error);
      return res.status(500).json(error);
    }
  }
);

export default router;
