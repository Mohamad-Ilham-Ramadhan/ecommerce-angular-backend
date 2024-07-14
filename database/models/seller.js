import { DataTypes } from "sequelize";
import { db } from "../init.js";

export const Seller = db.define(
   'Seller', 
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
      password: {
         type: DataTypes.STRING,
         allowNull: false,
      },
      email: {
         type: DataTypes.STRING,
         allowNull: false
      },
      image: {
         type: DataTypes.STRING
      }
   },
);

// Seller hasMany Product, Product hasOne to Seller

// db.sync();