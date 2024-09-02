import { DataTypes } from "sequelize";
import { db } from "../init.js";
import { Product } from "./product.js";
import { User } from "./user.js";
export const ProductReview = db.define(
   'ProductReview',
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true,
      },
      review: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      rate: {
         type: DataTypes.TINYINT,
         comment: 'Range from 1-5',
         allowNull: false,
         validate: {
            min: 1,
            max: 5
         }
      },
   }
);
Product.hasMany(ProductReview)
ProductReview.belongsTo(Product);
User.hasMany(ProductReview);
ProductReview.belongsTo(User);
// ProductReview belongs to User, User hasMany ProductReview

// db.sync();