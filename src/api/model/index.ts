export default [
  {
    name: "authModel",
    model: require("./auth").default,
  },
  {
    name: "roleModel",
    model: require("./role").default,
  },
  {
    name: "appointmentModel",
    model: require("./appointment").default,
  },
  {
    name: "sellerModel",
    model: require("./seller").default,
  },
  {
    name: "inquiryModel",
    model: require("./inquiry").default,
  },
];
