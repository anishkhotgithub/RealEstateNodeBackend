import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth";
import Container from "typedi";

class authController {
  createUser = async (req: Request, res: Response) => {
    const authServiceInstance = Container.get(AuthService);
    const data = await authServiceInstance.createAuth(req.body);

    return res.status(200).json({
      message: "success",
      data: data.user,
    });
  };
  getUser = async (req: Request, res: Response, next: NextFunction) => {
    const authServiceInstance = Container.get(AuthService);
    const data = await authServiceInstance.getUsers(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: data.user,
    });
  };
  updateUsers = async (req: Request, res: Response, next: NextFunction) => {
    const authServiceInstance = Container.get(AuthService);
    const data = await authServiceInstance.updateUsers(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: data.user,
    });
  };
  deleteUsers = async (req: Request, res: Response, next: NextFunction) => {
    const authServiceInstance = Container.get(AuthService);
    const data = await authServiceInstance.deleteUsers(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: data.user,
    });
  };
  login = async (req: Request, res: Response, next: NextFunction) => {
    const authServiceInstance = Container.get(AuthService);
    const data = await authServiceInstance.login(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: data,
    });
  };
  Logout = async (req: Request, res: Response, next: NextFunction) => {
    const authServiceInstance = Container.get(AuthService);
    const data = await authServiceInstance.Logout(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: data,
    });
  };
}
export default new authController();
