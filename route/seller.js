import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import {Seller} from '../database/models/seller.js';
import { getAuthToken } from '../utils/getAuthToken.js';

const secret = 'seller';

const upload = multer({dest: 'uploads/'});
const storage = multer.diskStorage({
   destination: 'uploads/',
   filename: function(req, file, cb) {
      console.log('diskStorage filename req', req)
      console.log('diskStorage filename file', file)
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 10000);
      let filetype = file.originalname.slice(file.originalname.lastIndexOf('.'))
      cb(null, uniqueSuffix + filetype)
   }
});
const up = multer({storage})
const router = express.Router();

// list of sellers
router.get('/', async (req, res) => {
   const adminToken = getAuthToken(req.headers.authorization);
   setTimeout(async () => {
      let token;
      try {
         token = jwt.verify(adminToken, 'admin');
      } catch (error) {
         return res.status(401).json({message: "You're unauthorized bitch!"});
      }
      try {
         if (token.role === 'admin') {
            const sellers = await Seller.findAll();
            return res.json(sellers);
         } else {
            return res.status(401).json({message: "You're unauthorized bitch!"});
         }
      } catch (error) {
         return res.status(500).json({
            message: error,
         });
      }
   }, 1000)
});

router.post('/create', up.single('image'), async (req, res) => {
   console.log('request', req.body)
   console.log('req.file', req.file);

   setTimeout(async () => {
      try {
         const newSeller = await Seller.create({
            name: req.body.name,
            email: req.body.email, 
            password: req.body.password,
            image: req.file.filename
         })
         res.json({
            message: 'Create new seller, success!',
            seller: newSeller,
            token: jwt.sign({id: newSeller.id, role: 'seller'}, secret, {expiresIn: 30})
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
         console.log('seller', seller)
         if (seller) {
            return res.json({
               seller, 
               token: jwt.sign({id: seller.id}, secret),
               message: "Login success!"
            })
         } else {
            return res.status(401).json({message: "Wrong credentials!, check your email or password, make sure it is correct."});
         }
      } catch (error) {
         console.log('/login catch error', error);
         res.status(500).json({
            message: 'Something broken in the server! asdf',
            error,
         })
      }
   }, 1000);
});

router.get('/:id', async (req, res) => {
   console.log('req', req.headers);
   console.log('req.params', req.params);
   setTimeout(async () => {
      try {
         jwt.verify(getAuthToken(req.headers.authorization), secret);
      } catch (error) {
         return res.status(401).json({error})
      }
      try {
         const seller = await Seller.findByPk(req.params.id);
         seller.password = null;
         return res.json(seller)
      } catch (error) {
         console.log('error', error.name, error.message);
         return res.status(500).json({message: 'Something wrong on the server.'})
      }
   }, 1000)
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