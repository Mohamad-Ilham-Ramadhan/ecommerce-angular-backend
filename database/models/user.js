import { DataTypes } from "sequelize";
import { db } from "../init.js";

export const User = db.define(
   'User', 
   {
      id: {
         type: DataTypes.INTEGER,
         autoIncrement: true,
         primaryKey: true
      },
      username: {
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

// User hasMany Purchase, Purchase hasMany to User

// db.sync();