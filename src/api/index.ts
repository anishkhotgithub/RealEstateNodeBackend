import { Router } from "express";

import auth from "./router/auth";
import role from "./router/role";
// import movie from "./router/movie";
export default () => {
  const router = Router();
  auth(router);
  role(router);
  // movie(router);
  return router;
};
