export function getAuthToken(authorizationHeader) {
   return authorizationHeader.split(' ')[1];
}