import { DataTypes } from "sequelize";
import { db } from "../init.js";

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

// ProductReview belongs to User, User hasMany ProductReview

// db.sync();