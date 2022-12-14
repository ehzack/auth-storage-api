const Boom = require("@hapi/boom");

module.exports = (requiredRole) => {
  return (req, res, next) => {
    let payload = req.user["https://hasura.io/jwt/claims"];

    if (payload["x-hasura-allowed-roles"].includes(requiredRole)) {
      return next();
    }
    return next(Boom.badImplementation("Unable Access"));
  };
};
