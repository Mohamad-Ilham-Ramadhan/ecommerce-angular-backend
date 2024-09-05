import { getAuthToken } from "../utils/getAuthToken.js";
import jwt from 'jsonwebtoken';

/**
 * 
 * @param {} secret jwt secret key
 * @param {} pass  pass jwtError to the next middleware or return http error(jwt) response in this middleware
 * @returns 
 */
export function verifyTokenMiddleware(secret, pass = false) {
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
         if (!pass && req.jwtError) return res.status(401).json(req.jwtError)
         next();
      } else {
         // verify token
         jwt.verify(getAuthToken(req.headers.authorization), secret, function(error, decoded) {
            console.log('decoded', decoded)
            console.log('error', error)
            jwtError = error; token = decoded;
         });
      
         req.token = token;
         req.jwtError = jwtError;;
         console.log('verifyTokenMiddleware req.token', req.token);
         if (!pass && req.jwtError) return res.status(401).json(req.jwtError)
         next();
      }
   }
}