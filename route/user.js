import express from 'express';
// import { User}
const router = express.Router();

router.get('/', (req, res) => {
   res.send('user page')
});

router.get('/create', (req, res) => {
   res.send('user create page')
});



export default router;