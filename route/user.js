import express from 'express';
import multer from 'multer';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { db } from '../database/init.js';
import { delayMiddleware } from '../middlewares/delayMiddleware.js';
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware.js';

import { User } from '../database/models/user.js';
import { ProductReviewNotif } from '../database/models/productReviewNotif.js';
import { Cart } from '../database/models/cart.js';
import { CartProducts } from '../database/models/cart.js';

const router = express.Router();
const secret = 'user';
const userUpload = multer({storage: multer.diskStorage({
   destination: 'images/user/',
   filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 10000);
      let filetype = file.originalname.slice(file.originalname.lastIndexOf('.'))
      cb(null, uniqueSuffix + filetype)
   }
})});

router.get('/', async (req, res) => {
   const users = await User.findAll();
   res.json(users)
});

router.get('/find-one', verifyTokenMiddleware(secret), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError)

   try {
      const user = await User.findByPk(req.token.id);
      return res.json(user)
   } catch (error) {
      console.log(error)
      return res.status(500).json(error)
   }
});
router.post('/create', delayMiddleware(1000), userUpload.single('image'), async (req, res) => {
   await db.transaction( async t => {
      try {
         const newUser = await User.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
            image: req.file.filename
         }, {transaction: t});
         await newUser.createCart({},{transaction: t});
         const token = jwt.sign({id: newUser.id, role: 'user'}, secret);
         return res.json({user: newUser, token});
      } catch (error) {
         console.log('error', error);
         // hapus image yang udah di upload
         if (req.file) {
            if (fs.existsSync(`./images/user/${req.file.filename}`)) {
               fs.promises.unlink(`./images/user/${req.file.filename}`).then(val => {
               })
            }
         }
         return res.status(500).json(error)
      }
   })
});
router.post('/login', delayMiddleware(1000), userUpload.single('image'), async (req, res) => {
   await db.transaction( async t => {
         try {
            const user = await User.findOne({
               where: {
                  email: req.body.email,
                  password: req.body.password,
               },
               include: ProductReviewNotif,
               transaction: t,
            });
            // const notifs = await ProductReviewNotif.findAll({
            //    where: { UserId: user.id},
            //    transaction: t,
            // })
            const token = jwt.sign({id: user.id, role: 'user'}, secret);
            // await t.commit();
            return res.json({user, token})
         } catch (error) {
            console.log('/users/login error', error);
            await t.rollback();
            return res.status(500).json(500);
         }
      })
});
router.delete('/delete', delayMiddleware(1000), verifyTokenMiddleware('admin'), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError);

   try {
      await User.destroy({
         where: { id: req.body.id}
      });
      const users = await User.findAll()
      return res.json(users)
   } catch (error) {
      return res.json(error)   
   }
});
router.delete('/truncate', delayMiddleware(1000), verifyTokenMiddleware('admin'), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError);

   try {
      await User.truncate()
      return res.json(true)
   } catch (error) {
      return res.json(error)   
   }
});
router.post('/cart/add', delayMiddleware(300), verifyTokenMiddleware(secret, true), userUpload.single('image'), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError)

   console.log('req.token', req.token);
   console.log('req.body', req.body);
   try {
      const user = await User.findByPk(req.token.id);
      const cart = await user.getCart();
      console.log('cart', cart)
      const isExist = await CartProducts.findOne({
         where: {
            CartId: cart.id,
            ProductId: req.body.productId
         }
      });
      console.log('isExist', isExist);
      if (isExist) {
         // update quantity
         await CartProducts.update({
            ProductQuantity: Number(isExist.ProductQuantity) + Number(req.body.quantity),
         }, {where: {
            CartId: cart.id,
            ProductId: req.body.productId,
         }});
      } else {
         await CartProducts.create({
            CartId: cart.id,
            ProductId: req.body.productId,
            ProductQuantity: req.body.quantity
         });
      }
      const cartProducts = await cart.getProducts();
      console.log('cartProducts', cartProducts)
      return res.json(cartProducts);
   } catch (error) {
      console.log('card add error', error)
      return res.status(500).json(error)
   }
});
router.get('/cart', delayMiddleware(300), verifyTokenMiddleware('user'), async (req, res) => {
   try {
      const products = await (await (await User.findByPk(req.token.id)).getCart()).getProducts()
      return res.json(products)
   } catch (error) {
      console.log('error', error)
      return res.status(500).json(error);
   }
});


export default router;