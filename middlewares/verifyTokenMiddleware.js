import { getAuthToken } from "../utils/getAuthToken.js";
import jwt from 'jsonwebtoken';

export function verifyTokenMiddleware(secret) {
   return (req, res, next) => {
      let jwtError = null;
      let token = null;

      if (Array.isArray(secret)) {
         console.log('secret key is an array');
         let jwts = []
         secret.forEach( s => {
            jwt.verify(getAuthToken(req.headers.authorization), s, function(error, decoded) {
               if (token === null && jwtError === null) {
                  token = decoded; jwtError = error;
               } else {
                  if (!token) {
                     token = decoded; jwtError = error;
                  }
               }
               jwts.push({token: decoded, error: jwtError})
            });
         })
         // const 
         req.token = token;
         req.jwtError = jwtError;
         next();
      } else {
         // verify token
         jwt.verify(getAuthToken(req.headers.authorization), secret, function(error, decoded) {
            jwtError = error; token = decoded;
         });
      
         req.token = token;
         req.jwtError = jwtError;
         next();
      }
   }
}