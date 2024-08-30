import { getAuthToken } from "../utils/getAuthToken.js";
import jwt from 'jsonwebtoken';

export function verifyTokenMiddleware(secret) {
   return (req, res, next) => {
      let jwtError = null;
      let token = null;
      console.log('bearer token', getAuthToken(req.headers.authorization))
      // verify token
      jwt.verify(getAuthToken(req.headers.authorization), secret, function(error, decoded) {
         jwtError = error; token = decoded;
      });
   
      req.token = token;
      req.jwtError = jwtError;
      next();
   }
}