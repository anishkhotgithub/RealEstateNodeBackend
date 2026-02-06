import { Router } from "express";
import roleController from "../controller/role";
const router = Router();
export default (app: Router) => {
  app.use("/role", router);
  router.post("/createRole", roleController.createRole);
  router.post("/getRoles", roleController.getRoles);
};
