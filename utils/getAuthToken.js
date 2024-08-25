/**
 * 
 * @param {string} authorizationHeader 
 * @returns string auth token
 */
export function getAuthToken(authorizationHeader) {
   return authorizationHeader.split(' ')[1];
}