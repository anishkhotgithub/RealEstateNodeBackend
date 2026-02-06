import { Router } from "express";
import sellerController from "../controller/seller";
const router = Router();
export default (app: Router) => {
  app.use("/seller", router);
  router.post("/createSeller", sellerController.createSeller);
  router.post("/getSellers", sellerController.getSellers);
};
