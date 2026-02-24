import authModel from "./auth";
import roleModel from "./role";
import appointmentModel from "./appointment";
import sellerModel from "./seller";
import inquiryModel from "./inquiry";

interface ModelConfig {
  name: string;
  model: any;
}

const models: ModelConfig[] = [
  {
    name: "authModel",
    model: authModel,
  },
  {
    name: "roleModel",
    model: roleModel,
  },
  {
    name: "appointmentModel",
    model: appointmentModel,
  },
  {
    name: "sellerModel",
    model: sellerModel,
  },
  {
    name: "inquiryModel",
    model: inquiryModel,
  },
];

export default models;
