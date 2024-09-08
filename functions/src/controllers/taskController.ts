import admin from "firebase-admin";
import {Timestamp} from "firebase-admin/firestore";
import express from "express";
import {TTaskData} from "../types";
import {TaskStatus} from "../constants";


// Get a reference to the Firestore database
const db = admin.firestore();


export const getUserTasks = async (req: express.Request, res: express.Response) => {
  console.log("in get of user Tasks");

  const userId = req["user"]?.uid;
  if (!userId) {
    return res.status(401).json({
      message: "User Unauthenticated!",
    });
  }

  console.log("requested tasks from : ", userId);

  const tasksCollectionRef = db.collection("tasks").where("user_id", "==", userId);
  const tasksSnap = await tasksCollectionRef.get();

  const tasks: TTaskData[] = tasksSnap.docs.map((d) => {
    const {name, description, userId, createdAt, updatedAt, dueDate, status} = d.data();

    return {
      taskId: d.id,
      name,
      description: description || "",
      user_id: userId,
      createdAt,
      updatedAt,
      dueDate: dueDate,
      status,
    } as TTaskData;
  });

  return res.status(200).json({
    tasks,
  });
};


export const postUserTask = async (req: express.Request, res: express.Response) => {
  console.log("in post of user Task");

  const userId = req["user"]?.uid;
  if (!userId) {
    return res.status(401).json({
      message: "User Unauthenticated!",
    });
  }

  const {name, description, dueDate} = req.body;

  console.log("dueDate: ", dueDate);

  if (!name || !String(name).trim()) {
    console.error("Task doesn't have a valid name");
    return res.status(400).json({
      message: "Task Doesn't have a valid title",
    });
  }

  let firebaseDueDate = null;
  try {
    firebaseDueDate = dueDate && typeof dueDate === "number" ? Timestamp.fromMillis(dueDate) : null;
  } catch (error) {
    console.error("Invalid Due Date in request: ", dueDate);
  }

  const taskData: Omit<TTaskData, "taskId"> = {
    name,
    description: description || null,
    user_id: userId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    dueDate: firebaseDueDate,
    status: TaskStatus.todo,
  };

  const tasksCollectionRef = db.collection("tasks");
  const taskSnap = await tasksCollectionRef.add(taskData);

  return res.status(200).json({
    message: "Task added Successfully!",
    task: {
      ...taskData,
      taskId: taskSnap.id,
    },
  });
};


export const updateUserTask = async (req: express.Request, res: express.Response) => {
  console.log("in update of user Task");

  const userId = req["user"]?.uid;
  // @ts-ignore: Taking param from request
  const taskId = req.params.task;

  console.log("for : ", taskId);

  if (!userId) {
    return res.status(401).json({
      message: "User Unauthenticated!",
    });
  }

  if (!taskId) {
    return res.status(400).json({
      message: "Failed to update Unknown Task!",
    });
  }

  const {name, description, dueDate} = req.body;
  let {status} = req.body;

  console.log("dueDate: ", dueDate);

  const updatedTask: Partial<TTaskData> = {
    updatedAt: Timestamp.now(),
  };
  if (name) {
    updatedTask["name"] = name;
  }
  if (description) {
    updatedTask["description"] = description;
  }
  if (dueDate && typeof dueDate === "number") {
    let firebaseDueDate = null;
    try {
      firebaseDueDate = dueDate && typeof dueDate === "number" ? Timestamp.fromMillis(dueDate) : null;
    } catch (error) {
      console.error("Invalid Due Date in request: ", dueDate);
    }
    updatedTask["dueDate"] = firebaseDueDate;
  }

  if (status === TaskStatus.todo) {
    console.log("The task is in the TODO state.");
  } else if (status === TaskStatus["in-progress"]) {
    console.log("The task is in progress.");
  } else if (status === TaskStatus.completed) {
    console.log("The task is done.");
  } else {
    console.log("Unknown status.");
    status = null;
  }

  if (status) {
    updatedTask["status"] = status;
  }

  const taskRef = db.collection("tasks").doc(taskId);

  await taskRef.update(updatedTask);

  return res.status(200).json({
    message: "Task Updated Successfully!",
    taskId,
  });
};


export const deleteUserTask = async (req: express.Request, res: express.Response) => {
  console.log("in delete of user Task");

  const userId = req["user"]?.uid;
  // @ts-ignore: Taking param from request
  const taskId = req.params.task;

  if (!userId) {
    return res.status(401).json({
      message: "User Unauthenticated!",
    });
  }

  if (!taskId) {
    return res.status(400).json({
      message: "Failed to delete Unknown Task!",
    });
  }

  const taskRef = db.collection("tasks").doc(taskId);

  const taskData = await taskRef.get();
  const taskUserId = taskData.data()?.user_id;

  if (userId !== taskUserId) {
    return res.status(403).json({
      message: "User not authorized to delete this Task!",
    });
  }

  await taskRef.delete();

  return res.status(200).json({
    message: "Task Deleted Successfully!",
    data: {
      taskId,
    },
  });
};
