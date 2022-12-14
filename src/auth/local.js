const express = require("express");
const Joi = require("joi");
const Boom = require("@hapi/boom");
const bcrypt = require("bcryptjs");
const uuidv4 = require("uuid/v4");
const jwt = require("jsonwebtoken");
const { graphql_client } = require("../graphql-client");
const auth_functions = require("./auth-functions");
const moment = require("moment");
const isAuth = require("./middlewares/isAuth");
const checkRole = require("./middlewares/checkRole");

const {
  USER_FIELDS,
  USER_REGISTRATION_AUTO_ACTIVE,
  USER_MANAGEMENT_DATABASE_SCHEMA_NAME,
  REFRESH_TOKEN_EXPIRES,
  JWT_TOKEN_EXPIRES,
  HASURA_GRAPHQL_JWT_SECRET,
} = require("../config");

let router = express.Router();

const schema_name =
  USER_MANAGEMENT_DATABASE_SCHEMA_NAME === "public"
    ? ""
    : USER_MANAGEMENT_DATABASE_SCHEMA_NAME.toString().toLowerCase() + "_";

router.post(
  "/register_broker",
  isAuth,
  checkRole("manager"),
  async (req, res, next) => {
    let hasura_data;
    let password_hash;

    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      username: Joi.string().allow(null),
      password: Joi.string().required(),
      name: Joi.string().allow(null),
      register_data: Joi.object().allow(null),
      avatar_profile: Joi.object().allow(null),
      phone: Joi.string().allow(null),
      categorys: Joi.array().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return next(Boom.badRequest(error.details[0].message));
    }

    const {
      email,
      username,
      password,
      name,
      register_data,
      avatar_profile,
      phone,
      categorys,
    } = value;
    try {
      // create user account

      const mutation = `
        mutation (
          $user: ${schema_name}users_insert_input!
        ) {
          insert_${schema_name}users (
            objects: [$user]
          ) {
            affected_rows
            returning {
              id
            }
          }
        }
        `;

      // create user and user_account in same mutation

      var response = await graphql_client.request(mutation, {
        user: {
          display_name: `${name}`,
          email: email,
          active: true,
          secret_token: uuidv4(),
          first_name: name,
          last_name: name,
          avatar_profile: avatar_profile,
          user_roles: {
            data: {
              role: "broker",
            },
          },
          user_accounts: {
            data: {
              username: username,
              email: email,
              password: await bcrypt.hash(password, 10),
              register_data,
            },
          },
          brokers: {
            data: {
              name,
              addressByAddress: { data: {} },
              avatar_profile: avatar_profile,
              phone: phone,
              brokers_categories: {
                data: categorys.map((e) => ({ category_id: e })),
              },
            },
          },
        },
      });
    } catch (e) {
      console.error(e);
      return next(Boom.badImplementation("Unable to create user."));
    }
    let id = response.insert_users.returning[0].id;

    res.json({ user_id: id });
  }
);

router.post(
  "/registerAdmin",
  isAuth,
  checkRole("super_admin"),
  async (req, res, next) => {
    let hasura_data;
    let password_hash;

    const schema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      firstName: Joi.string().allow(null),
      lastName: Joi.string().allow(null),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return next(Boom.badRequest(error.details[0].message));
    }

    const { email, password, firstName, lastName } = value;
    try {
      // create user account

      const mutation = `
  mutation (
    $user: ${schema_name}users_insert_input!
  ) {
    insert_${schema_name}users (
      objects: [$user]
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
  `;

      // create user and user_account in same mutation

      var response = await graphql_client.request(mutation, {
        user: {
          display_name: `${firstName} ${firstName}`,
          email: email,
          active: true,
          secret_token: uuidv4(),
          first_name: firstName,
          last_name: lastName,

          user_roles: {
            data: {
              role: "manager",
            },
          },
          user_accounts: {
            data: {
              email: email,
              password: await bcrypt.hash(password, 10),
            },
          },
        },
      });
    } catch (e) {
      console.error(e);
      return next(Boom.badImplementation("Unable to create user."));
    }
    let id = response.insert_users.returning[0].id;

    res.json({ user_id: id });
  }
);
router.post("/register", async (req, res, next) => {
  let hasura_data;
  let password_hash;

  const schema = Joi.object().keys({
    email: Joi.string().email().required(),
    username: Joi.string().allow(null),
    password: Joi.string().required(),
    firstName: Joi.string().allow(null),
    lastName: Joi.string().allow(null),
    register_data: Joi.object().allow(null),
    avatar_profile: Joi.object().allow(null),
    aff_uuid: Joi.string().uuid().allow(null),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(Boom.badRequest(error.details[0].message));
  }

  const {
    email,
    username,
    password,
    lastName,
    firstName,
    register_data,
    avatar_profile,
    aff_uuid,
  } = value;
  try {
    // create user account

    var customer = await auth_functions.create_customer_stripe(email);
    var configs = await auth_functions.GetConfigs();
    var init_plan_days = configs.find((e) => e.config_name === "init_plan");
    var plan_days = init_plan_days ? init_plan_days.params : 0;
    var isBroker = false;
    var affiliate_benefit_customer = configs.find(
      (e) => e.config_name === "affiliate_benefit_customer"
    );
    var affiliate_benefit_broker = configs.find(
      (e) => e.config_name === "affiliate_benefit_broker"
    );
    if (aff_uuid) {
      var user_affiliate = await auth_functions.searchUsers(aff_uuid);
      if (user_affiliate.length > 0) {
        if (affiliate_benefit_customer) {
          plan_days += affiliate_benefit_customer.params;
        }

        if (user_affiliate[0].user_roles.some((e) => e.role === "broker")) {
          isBroker = true;
        }
      }
    }

    const mutation = `
  mutation (
    $user: ${schema_name}users_insert_input!
  ) {
    insert_${schema_name}users (
      objects: [$user]
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
  `;

    // create user and user_account in same mutation

    var response = await graphql_client.request(mutation, {
      user: {
        display_name: `${firstName} ${firstName}`,
        email: email,
        active: USER_REGISTRATION_AUTO_ACTIVE,
        secret_token: uuidv4(),
        first_name: firstName,
        last_name: lastName,
        avatar_profile: avatar_profile,
        stripe_customer_id: customer.customer_id,

        customers_plan_historics: {
          data: {
            expire_at: `"${moment(moment(), "MM-DD-YYYY")
              .add(plan_days, "days")
              .format("MM-DD-YYYY")}"`,
          },
        },
        user_roles: {
          data: {
            role: "customer",
          },
        },
        user_accounts: {
          data: {
            username: username,
            email: email,
            password: await bcrypt.hash(password, 10),
            register_data,
          },
        },
        account_settings: {
          data: {},
        },
      },
    });

    let id = response.insert_users.returning[0].id;

    if (aff_uuid) {
      if (isBroker) {
        await auth_functions.addNotificaiton2Broker(
          aff_uuid,
          affiliate_benefit_broker
        );
      } else {
        await auth_functions.addPlanToUser(
          aff_uuid,
          affiliate_benefit_customer
        );
      }
    }

    res.json({ user_id: id });
  } catch (e) {
    console.error(e);
    return next(Boom.badImplementation("Unable to create user."));
  }
});

router.post("/new-password", async (req, res, next) => {
  let hasura_data;
  let password_hash;

  const schema = Joi.object().keys({
    secret_token: Joi.string()
      .uuid({ version: ["uuidv4"] })
      .required(),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    return next(Boom.badRequest(error.details[0].message));
  }

  const { secret_token, password } = value;

  // update password and username activation token
  try {
    password_hash = await bcrypt.hash(password, 10);
  } catch (e) {
    console.error(e);
    return next(Boom.badImplementation(`Unable to generate 'password_hash'`));
  }

  const query = `
  mutation (
    $secret_token: uuid!,
    $password_hash: String!,
    $new_secret_token: uuid!
    $now: timestamptz!
  ) {
    update_user_account_password: update_${schema_name}user_accounts (
      where: {
        _and: [
          {
            user: {
              secret_token: { _eq: $secret_token}
            },
          }, {
            user: {
              secret_token_expires_at: { _gt: $now }
            }
          }
        ]
      }
      _set: {
        password: $password_hash,
      }
    ) {
      affected_rows
    }
    update_secret_token: update_${schema_name}users (
      where: {
        _and: [
          {
            secret_token: { _eq: $secret_token}
          }, {
            secret_token_expires_at: { _gt: $now }
          }
        ]
      }
      _set: {
        secret_token: $new_secret_token
        secret_token_expires_at: $now
      }
    ) {
      affected_rows
    }
  }
  `;

  try {
    const new_secret_token = uuidv4();
    hasura_data = await graphql_client.request(query, {
      secret_token,
      password_hash,
      new_secret_token,
      now: new Date(),
    });
  } catch (e) {
    console.error(e);
    return next(Boom.unauthorized(`Unable to update 'password'`));
  }

  if (hasura_data.update_secret_token.affected_rows === 0) {
    console.error(
      "No user to update password for. Also maybe the secret token has expired"
    );
    return next(Boom.badRequest(`Unable to update password for user`));
  }

  // return 200 OK
  res.send("OK");
});

router.post("/login", async (req, res, next) => {
  // validate username and password
  const schema = Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error, value } = schema.validate(req.body);

  if (error) {
    console.error(error);
    return next(Boom.badRequest(error.details[0].message));
  }

  const { email, password } = value;
  console.log({ email, password });

  let query = `
  query (
    $email: String!
  ) {
    user_accounts: ${schema_name}user_accounts (
      where: {
        email: { _eq: $email}
      }
    ) {
      password
      user {
        id
        active
        default_role
        brokers{
          id
        }
        user_roles {
          role
        }
        ${USER_FIELDS.join("\n")}
      }
    }
  }
  `;
  let hasura_data;
  try {
    hasura_data = await graphql_client.request(query, {
      email,
    });
  } catch (e) {
    console.error(e);
    // console.error('Error connection to GraphQL');
    return next(Boom.unauthorized("Impossible de trouver l'utilisateur"));
  }

  if (hasura_data[`${schema_name}user_accounts`].length === 0) {
    // console.error("No user with this 'username'");
    return next(Boom.unauthorized("Adresse email ou mot de passe incorrect"));
  }

  // check if we got any user back
  const user_account = hasura_data[`${schema_name}user_accounts`][0];

  if (!user_account.user.active) {
    // console.error('User not activated');
    return next(Boom.unauthorized("Compte pas encore activé"));
  }

  // see if password hashes matches
  const match = await bcrypt.compare(password, user_account.password);

  if (!match) {
    console.error("Password does not match");
    return next(Boom.unauthorized("Adresse email ou mot de passe incorrect"));
  }

  const jwt_token = auth_functions.generateJwtToken(user_account.user);

  // generate refresh token and put in database
  query = `
  mutation (
    $refresh_token_data: ${schema_name}refresh_tokens_insert_input!
  ) {
    insert_${schema_name}refresh_tokens (
      objects: [$refresh_token_data]
    ) {
      affected_rows
    }
  }
  `;

  const refresh_token = uuidv4();
  try {
    await graphql_client.request(query, {
      refresh_token_data: {
        user_id: user_account.user.id,
        refresh_token: refresh_token,
        expires_at: new Date(
          new Date().getTime() + REFRESH_TOKEN_EXPIRES * 60 * 1000
        ), // convert from minutes to milli seconds
      },
    });
  } catch (e) {
    console.error(e);
    return next(
      Boom.badImplementation("Could not update 'refresh token' for user")
    );
  }
  var decoded = jwt.decode(jwt_token, { complete: true });
  let jwt_token_expires = decoded.payload.exp;

  // return jwt token and refresh token to client
  console.log({
    refresh_token,
    jwt_token,
    jwt_token_expires,
  });
  res.json({
    refresh_token,
    jwt_token,
    jwt_token_expires,
  });
});

module.exports = router;
