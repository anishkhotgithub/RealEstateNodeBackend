import { Request, Response } from "express";
import sellerService from "../services/seller";
import Container from "typedi";

class sellerController {
  createSeller = async (req: Request, res: Response) => {
    const sellerServiceInstance = Container.get(sellerService);
    const seller = await sellerServiceInstance.createSeller(req.body);

    return res.status(200).json({
      message: "success",
      data: seller.seller,
    });
  };
  getSellers = async (req: Request, res: Response) => {
    const sellerServiceInstance = Container.get(sellerService);
    const seller = await sellerServiceInstance.getSellers(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: seller.seller,
    });
  };
}
export default new sellerController();
