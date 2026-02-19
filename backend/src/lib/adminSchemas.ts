import { body } from "express-validator";
import { SECOND_YEAR_PORS } from "./constants";

export const validateUser = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name must contain only alphabets"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email format"),
  body("departmentId")
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage("Invalid department ID"),
  body("specificPosition")
    .optional()
    .isIn(SECOND_YEAR_PORS)
    .withMessage("Invalid specific position"),
];

export const validateUserIdAndDept = [
  body("id").trim().isInt({ min: 1 }).withMessage("Invalid ID"),
  body("departmentId")
    .isInt({ min: 1, max: 8 })
    .withMessage("Invalid department ID"),
];

export const validateUserId = [
  body("id").trim().isInt({ min: 1 }).withMessage("Invalid ID"),
];

export const validateLogId = [
  body("id").trim().isInt({ min: 1 }).withMessage("Invalid ID"),
];
