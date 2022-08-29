const { check, validationResult } = require("express-validator");

exports.registerRules = () => [
  check(
    "username",
    "This field should have between 4 and 15 characters"
  ).isLength({ min: 4, max: 15 }),
  check("email", "This field should be a valid email address").isEmail(),
  check("password", "Password should have at least 6 characters").isLength({
    min: 6,
  }),
  check("bio", "This field should have at most 1024 characters").isLength({
    max: 1024,
  }),
];

exports.loginRules = () => [
  check("email", "This field should be a valid email").isEmail(),
  check("password", "Password should have at least 6 characters").isLength({
    min: 6,
  }),
];

exports.validator = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    //return res.status(400).send({ errors: errors.array() });
    return res.status(400).send(errors.mapped());
  }
  next();
};
