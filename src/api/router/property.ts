import { Router } from "express";
import propertyController from "../controller/property";
const router = Router();
export default (app: Router) => {
  app.use("/property", router);
  router.post("/createProperty", propertyController.createProperty);
  router.post("/getProperties", propertyController.getProperties);
};
