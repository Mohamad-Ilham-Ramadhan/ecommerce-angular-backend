import express from 'express';
import multer from 'multer';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { delayMiddleware } from '../middlewares/delayMiddleware.js';
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware.js';
import { Product } from '../database/models/product.js';
import { Seller } from '../database/models/seller.js';
import { Purchase } from '../database/models/purchase.js';
import { PurchaseDetail } from '../database/models/purchaseDetail.js';
import { User } from '../database/models/user.js';

const router = express.Router();
const secret = 'product';
const productUpload = multer({storage: multer.diskStorage({
   destination: 'images/product/',
   filename: function(req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 10000);
      let filetype = file.originalname.slice(file.originalname.lastIndexOf('.'))
      cb(null, uniqueSuffix + filetype)
   }
})});

router.get('/', async (req, res) => {

   try {
      const products = await Product.findAll({include: {
         model: Seller,
         attributes: ['name', 'id', 'image', 'email']
      }});
      return res.json(products);
   } catch (error) {
      console.log('error', error);
      return res.status(500).json(error)
   }
});
router.get('/:id', delayMiddleware(1000), async (req, res) => {
   console.log('req.body', req.body);
   console.log('req.id', req.id)
   console.log('req.params', req.params)
   try {
      const product = await Product.findByPk(req.params.id, {include: Seller});
      product.Seller.password = null;
      console.log('product', product)
      if (!product) {
         return res.status(204).json(null)
      }
      return res.json(product);
   } catch (error) {
      console.log('error', error)
      return res.json(error)
   }
});
router.get('/find-one', verifyTokenMiddleware(secret), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError)

   try {
      const product = await product.findByPk(req.token.id);
      return res.json(product)
   } catch (error) {
      console.log(error)
      return res.status(500).json(error)
   }
});
router.post('/create', delayMiddleware(1000), productUpload.single('image'), async (req, res) => {
   try {
      const newproduct = await product.create({
         name: req.body.name,
         productname: req.body.productname,
         email: req.body.email,
         password: req.body.password,
         image: req.file.filename
      });
      const token = jwt.sign({id: newproduct.id, role: 'product'}, secret);
      return res.json({product: newproduct, token});
   } catch (error) {
      console.log('error', error);
      // hapus image yang udah di upload
      if (req.file) {
         if (fs.existsSync(`./images/product/${req.file.filename}`)) {
            fs.promises.unlink(`./images/product/${req.file.filename}`).then(val => {
            })
         }
      }
      return res.status(500).json(error)
   }
});
router.post('/login', delayMiddleware(1000), productUpload.single('image'), async (req, res) => {

   try {
      const product = await product.findOne({
         where: {
            email: req.body.email,
            password: req.body.password,
         }
      });
      const token = jwt.sign({id: product.id, role: 'product'}, secret);
      return res.json({product, token})
   } catch (error) {
      console.log(error)
      return res.status(500).json(500);
   }
});
router.delete('/delete', delayMiddleware(1000), verifyTokenMiddleware('admin'), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError);
   try {
      await Product.destroy({
         where: { id: req.body.id}
      });
      const products = await Product.findAll({include: Seller})
      return res.json(products)
   } catch (error) {
      return res.json(error)   
   }
});
router.delete('/truncate', delayMiddleware(1000), verifyTokenMiddleware('admin'), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError);

   try {
      await Product.truncate();
      return res.json(true)
   } catch (error) {
      return res.json(error)   
   }
});
router.post('/buy-now', delayMiddleware(1000), verifyTokenMiddleware('user'), productUpload.single('image'), async (req, res) => {
   if (req.jwtError) return res.status(401).json(req.jwtError)
   
   req.body.product = JSON.parse(req.body.product)
   console.log('/buy-now req.body', req.body)
   console.log('/buy-now req.body.product.stock', req.body.product.stock)
   console.log('/buy-now req.body.product.id', req.body.product.id)
   console.log('/buy-now req.token', req.token);
   console.log('/buy-now req.body.totalPrice', req.body.totalPrice);
   // update stock in the product
   // insert purchase
   
   try {
      const product = await Product.update({
         stock: req.body.product.stock - req.body.quantity,
      }, {
         where: {
            id: req.body.product.id
         }
      });
      const user = await User.findByPk(req.token.id);
      console.log('user.id', user.id)
      const purchase = await user.createPurchase({
         totalPrice: req.body.totalPrice,
         // UserId: user.id
      });
      // await user.setPurchase(purchase)
      console.log('purchase.id', purchase.id)
      const purchaseDetail = await purchase.createPurchaseDetail({
         sellerId: req.body.product.Seller.id,
         sellerName: req.body.product.Seller.name,
         productId: req.body.product.id,
         productName: req.body.product.name,
         productImage: req.body.product.image,
         productPrice: req.body.product.price,
         productQuantity: req.body.quantity,
         // PurchaseId: purchase.id
      });

      return res.json('testing')
   } catch (error) {
      console.log('error', error)
      return res.status(500).json(error)
   }
});


export default router;