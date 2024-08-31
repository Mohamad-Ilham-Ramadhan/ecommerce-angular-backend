import express from 'express';
import { User } from '../database/models/user.js';
import { delayMiddleware } from '../middlewares/delayMiddleware.js';
import { verifyTokenMiddleware } from '../middlewares/verifyTokenMiddleware.js';
import multer from 'multer';
import fs from 'fs';

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

router.post('/create', delayMiddleware(1000), userUpload.single('image'), async (req, res) => {

   try {
      const newUser = await User.create({
         name: req.body.name,
         username: req.body.username,
         email: req.body.email,
         password: req.body.password,
         image: req.file.filename
      });
      return res.json(newUser);
   } catch (error) {
      console.log('error', error);
      // hapus image yang udah di upload
      if (req.file) {
         if (fs.existsSync(`./images/user/${req.file.filename}`)) {
            fs.promises.unlink(`./images/user/${req.file.filename}`).then(val => {
            })
         }
      }
      return res.json(error)
   }
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


export default router;