import { Router } from "express";
import authController from "../controller/auth";
import { AuthMiddleware } from "../../middleware/authMiddleware";
const authMiddleware = new AuthMiddleware();
const router = Router();
export default (app: Router) => {
  app.use("/auth", router);
  router.post("/createUser", authController.createUser);
  router.post("/getUsers", authMiddleware.verifyToken, authController.getUser);
  router.post(
    "/updateUsers",
    authMiddleware.verifyToken,
    authController.updateUsers,
  );
  router.post(
    "/deleteUsers",
    authMiddleware.verifyToken,
    authController.deleteUsers,
  );
  router.post("/login", authController.login);
  router.post("/Logout", authController.Logout);
};
