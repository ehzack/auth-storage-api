const jwt = require("express-jwt");
const {
  JWT_TOKEN_EXPIRES,
  HASURA_GRAPHQL_JWT_SECRET,
  STORAGE_JWT_SECRET,
  USER_FIELDS,
  SMPT_AUTH_USER,
  SMPT_AUTH_PASS,
} = require("../../config");
const getTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
};

module.exports = jwt({
  secret: HASURA_GRAPHQL_JWT_SECRET.key,
  getToken: getTokenFromHeader,
  algorithms: [HASURA_GRAPHQL_JWT_SECRET.type],
});
