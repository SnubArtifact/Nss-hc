import { body } from "express-validator";

export const validateHourLog = [
  body("startDate")
    .trim()
    .toDate()
    .isISO8601()
    .withMessage("Invalid date format. Date must follow ISO8601 format"),
  body("endDate")
    .trim()
    .isISO8601()
    .withMessage("Invalid date format. Date must follow ISO8601 format")
    .toDate(),
  body("startTime")
    .trim()
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format. Time must be of the format 00:00"),
  body("endTime")
    .trim()
    .matches(/^([01][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format. Time must be of the format 00:00"),
  body("task")
    .trim()
    .isString()
    .withMessage("Task must be a valid string")
    .notEmpty()
    .withMessage("Task must not be empty"),
  body("seniorPresent")
    .optional()
    .isAlpha("en-US", { ignore: " " })
    .withMessage("Name of a senior must only contain alphabets"),
  body("category")
    .trim()
    .isIn(["Dept", "Meet", "Event", "Misc"])
    .withMessage(
      "Invalid category. Must be one of 'Dept', 'Meet', 'Event', 'Misc'"
    ),
];
