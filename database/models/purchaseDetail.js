import { DataTypes } from "sequelize";
import { db } from "../init.js";

export const PurchaseDetail = db.define(
   'PurchaseDetail', 
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
      },
      sellerId: {
         type: DataTypes.INTEGER,
         allowNull: false,
      }, 
      productId: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      productName: {
         type: DataTypes.STRING,
         allowNull: false
      },
      productImage: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      productPrice: {
         type: DataTypes.INTEGER,
         allowNull: false,
      },
      productQuantity: {
         type: DataTypes.DOUBLE,
         allowNull: false,
      },
   },
);

// User hasMany Purchase, Purchase hasMany to User
console.log('PurchaseDetail Model')
