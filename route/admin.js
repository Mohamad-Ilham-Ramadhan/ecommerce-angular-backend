import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken'
import {Admin} from '../database/models/admin.js';

const secret = 'admin';

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
         const newAdmin = await Admin.create({
            name: req.body.name,
            username: req.body.username,
            email: req.body.email, 
            password: req.body.password,
         })
         res.json({
            message: 'Create new admin, success!',
            seller: newAdmin,
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
         const admin = await Admin.findOne({
            where: {
               username: req.body.username,
               password: req.body.password,
            }
         });
         const token = jwt.sign({id: admin.id, role: 'admin'}, secret)
         res.json({data: admin, message: 'Login success', token})
      } catch (error) {
         res.status(500).json({
            message: 'Something broken in the server! Shut up!',
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