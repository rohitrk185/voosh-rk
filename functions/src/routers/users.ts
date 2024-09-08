import express from "express";
import {createUser} from "../controllers/userController";
export const router = express.Router();

// router.get("/:userId", getUser);
router.post("/", createUser);
// router.patch("/:task", updateUser);
// router.delete("/:task", deleteUserTask);


// module.exports = router;
