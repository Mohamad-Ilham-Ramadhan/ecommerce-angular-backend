import { DataTypes } from "sequelize";
import { db } from "../init.js";

export const Purchase = db.define(
   'Purchase', 
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
      },
      totalPrice: {
         type: DataTypes.DOUBLE,
         allowNull: false,
      },
   },
);
console.log('Purchase Model')
// User hasMany Purchase, Purchase hasMany to User