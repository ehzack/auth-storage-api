const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");
const { graphql_client } = require("../graphql-client");
const moment = require("moment");

const {
  JWT_TOKEN_EXPIRES,
  HASURA_GRAPHQL_JWT_SECRET,
  STORAGE_JWT_SECRET,
  USER_FIELDS,
  SMPT_AUTH_USER,
  SMPT_AUTH_PASS,
  HASURA_CORE,
} = require("../config");

let transport = nodemailer.createTransport({
  name: "elhedadi.com",
  host: "ssl0.ovh.net",
  port: 465,
  secure: true,
  auth: {
    user: SMPT_AUTH_USER,
    pass: SMPT_AUTH_PASS,
  },
});

module.exports = {
  generateJwtToken: function (user) {
    let custom_claims = {};

    USER_FIELDS.forEach((user_field) => {
      custom_claims["x-hasura-" + user_field.replace("_", "-")] =
        user[user_field].toString();
    });

    const user_roles = user.user_roles.map((role) => {
      return role.role;
    });

    if (!user_roles.includes(user.default_role)) {
      user_roles.push(user.default_role);
    }

    return jwt.sign(
      {
        "https://hasura.io/jwt/claims": {
          "x-hasura-allowed-roles": user_roles,
          "x-hasura-default-role": user.default_role,
          "x-hasura-user-id": user.id.toString(),
          "x-hasura-broker-id":
            user.brokers && user.brokers.length > 0
              ? `${user.brokers[0].id}`
              : "",
          ...custom_claims,
        },
      },
      HASURA_GRAPHQL_JWT_SECRET.key,
      {
        algorithm: HASURA_GRAPHQL_JWT_SECRET.type,
        expiresIn: `${JWT_TOKEN_EXPIRES}m`,
      }
    );
  },
  sendMail: function (message) {
    transport.sendMail(message, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log("done");
        console.log(info);
      }
    });
  },
  create_customer_stripe: async function (email) {
    let result = await axios.post(
      `${HASURA_CORE}/PayementAction/create-customer`,
      { email }
    );
    return result;
  },

  async GetConfigs() {
    var response = await graphql_client.request(`query{
      configs{
        params
        config_name
      }
    }`);
    return response.configs;
  },

  async searchUsers(user_id) {
    var response = await graphql_client.request(`query{
      users(where:{id:{_eq:"${user_id}"}}){
        id
        user_roles{
          role
        }
      }
    }`);
    return response.users;
  },

  async addNotificaiton2Broker(user_id, config) {
    var response = await graphql_client.request(`query{
      brokers(where:{user_id:{_eq:"${user_id}"}}){
        id
        dispatch_count
      }
    }`);

    let broker = response.brokers;
    if (broker.length > 0) {
      console.log({ config });
      let dispatch_notification =
        broker[0].dispatch_count + (config.params || 0);
      let broker_id = broker[0].id;

      console.log(`    mutation {
        update_brokers(where: {id: {_eq: "${broker_id}"}}, _set: {dispatch_count: ${dispatch_notification}}) {
          affected_rows
        }
      `);
      let response2 = await graphql_client.request(`
      mutation {
        update_brokers(where: {id: {_eq: "${broker_id}"}}, _set: {dispatch_count: ${dispatch_notification}}) {
          affected_rows
        }
      }
      `);
    }

    return response;
  },

  async addPlanToUser(user_id, config) {
    var response = await graphql_client.request(`
    {
      customers_plan_historic(limit: 1, order_by: {created_at: desc}, where: {customer_id: {_eq: "${user_id}"}}) {
        expire_at
        plan_id
      customer_id
      }
    }
    
    `);

    if (response.customers_plan_historic.length > 0) {
      let customer = response.customers_plan_historic[0];

      var respons2 = await graphql_client.request(`
      mutation {
        insert_customers_plan_historic(objects: {customer_id: "${
          customer.customer_id
        }", expire_at: "${moment(
        moment(customer.expire_at).format("MM-DD-YYYY"),
        "MM-DD-YYYY"
      )
        .add(config.params, "days")
        .format("MM-DD-YYYY")}", plan_id: ${customer.plan_id}}) {
          affected_rows
        }
      }
      
      `);
    }
    return response;
  },
};
