import { Request, Response } from "express";
import propertyService from "../services/property";
import Container from "typedi";

class propertyController {
  createProperty = async (req: Request, res: Response) => {
    const propertyServiceInstance = Container.get(propertyService);
    const property = await propertyServiceInstance.createProperty(req.body);

    return res.status(200).json({
      message: "success",
      data: property.property,
    });
  };
  getProperties = async (req: Request, res: Response) => {
    const propertyServiceInstance = Container.get(propertyService);
    const property = await propertyServiceInstance.getProperties(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: property.property,
    });
  };
}
export default new propertyController();
