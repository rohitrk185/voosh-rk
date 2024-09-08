import express from "express";
import {getUserTasks, postUserTask, updateUserTask, deleteUserTask} from "../controllers/taskController";

export const router = express.Router();

router.get("/", getUserTasks);
router.post("/", postUserTask);
router.patch("/:task", updateUserTask);
router.delete("/:task", deleteUserTask);


// module.exports = router;
