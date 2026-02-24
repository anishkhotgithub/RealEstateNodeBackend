import { Request, Response, NextFunction } from "express";
import inquiryService from "../services/inquiry";
import Container from "typedi";

class inquiryController {
  createInquiry = async (req: Request, res: Response) => {
    const inquiryServiceInstance = Container.get(inquiryService);
    const inquiry = await inquiryServiceInstance.createInquiry(req.body);

    return res.status(200).json({
      message: "success",
      data: inquiry.inquiry,
    });
  };
  getInquiries = async (req: Request, res: Response) => {
    const inquiryServiceInstance = Container.get(inquiryService);
    const inquiry = await inquiryServiceInstance.getInquiries(req.body);
    return res.status(200).json({
      code: 200,
      message: "success",
      data: inquiry.inquiry,
    });
  };
}
export default new inquiryController();
