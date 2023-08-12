import { Router } from "express";
import * as UserController from "./user.controller";
import { validate } from "../../validators/common/validate";
import { userValidations } from "../../validators/resources/user.validations";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(UserController.getAllUsers));
router.post("/", validate(...userValidations("create")), asyncHandler(UserController.createUser));

export default router