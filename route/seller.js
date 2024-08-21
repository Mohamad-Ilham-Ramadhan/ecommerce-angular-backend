import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import {Seller} from '../database/models/seller.js';

const secret = 'ilham';

const upload = multer({dest: 'uploads/'})
const router = express.Router();

router.get('/', async (req, res) => {
   setTimeout(async () => {
      try {
         const sellers = await Seller.findAll();
         res.json(sellers);
      } catch (error) {
         res.status(500).json({
            message: 'Something broken`'
         });
      }
   }, 1000)
});

router.post('/create', upload.single('image'), async (req, res) => {
   console.log('request', req.body)
   setTimeout(async () => {
      try {
         const newSeller = await Seller.create({
            name: req.body.name,
            email: req.body.email, 
            password: req.body.password,
         })
         res.json({
            message: 'Create new seller, success!',
            seller: newSeller,
         })
      } catch (error) {
         res.status(500).json({
            message: 'Something broken in the server!'
         })
      }
   }, 1500)
});

router.post('/login', upload.single('image'), async (req, res) => {
   setTimeout(async () => {
      console.log('login req.body', req.body)
      try {
         const seller = await Seller.findOne({
            where: {
               email: req.body.email,
               password: req.body.password,
            }
         });
         res.json({seller, token: jwt.sign({id: seller.id}, secret)})
      } catch (error) {
         res.status(500).json({
            message: 'Something broken in the server! asdf',
            error,
         })
      }
   }, 1000);
});

router.delete('/truncate', async (req, res) => {
   try {
      await Seller.destroy({
         truncate: true
      });
      res.json({
         message: 'Delete all success!'
      })
   } catch (e) {
      res.status(500).json({
         message: 'Delete failed!, problem in the server!'
      })
   }
});

router.delete('/:id', async (req, res) => {
   console.log('request.params', req.params)
   setTimeout(async () => {
      try {
         await Seller.destroy({
            where: {
               id: req.params.id
            }
         });
         const sellers = await Seller.findAll()
         res.json({
            message: 'Delete seller, success!',
            sellers
         })
      } catch (error) {
         res.status(500).json({
            message: 'Something broken in the server!'
         })
      }
   }, 1000)
});



export default router;