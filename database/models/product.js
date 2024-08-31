import { DataTypes } from "sequelize";
import { db } from "../init.js";
export const Product = db.define(
   'Product',
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
      },
      name: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      description: {
         type: DataTypes.TEXT,
         allowNull: false,
      },
      stock: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      price: {
         type: DataTypes.DOUBLE,
         allowNull: false,
      },
      image: {
         type: DataTypes.STRING
      }
   }
);
// Shop has many Product, Product belongsto Shop
// Seller has many Shop, Shop belongsto Seller
// Product has many ProductReview, ProductReview belongsto Product
// db.sync();