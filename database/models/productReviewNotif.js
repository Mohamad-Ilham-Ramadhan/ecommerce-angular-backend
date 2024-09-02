import { DataTypes } from "sequelize";
import { db } from "../init.js";
import { Product } from "./product.js";
import { User } from "./user.js";

export const ProductReviewNotif = db.define(
   'ProductReviewNotif',
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true,
      },
   }
);

Product.hasMany(ProductReviewNotif);
ProductReviewNotif.belongsTo(Product);
User.hasMany(ProductReviewNotif);
ProductReviewNotif.belongsTo(User);
// console.log('ProductReviewNotif')
// ProductReview belongs to User, User hasMany ProductReview

// db.sync();