import { Request, Response, NextFunction } from "express";
import roleService from "../services/role";
import Container from "typedi";

class roleController {
  createRole = async (req: Request, res: Response) => {
    const roleServiceInstance = Container.get(roleService);
    const role = await roleServiceInstance.createRole(req.body);

    return res.status(200).json({
      message: "success",
      data: role,
    });
  };
  getRoles = async (req: Request, res: Response, next: NextFunction) => {
    const roleServiceInstance = Container.get(roleService);
    const role = await roleServiceInstance.getRoles(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: role,
    });
  };
}
export default new roleController();
