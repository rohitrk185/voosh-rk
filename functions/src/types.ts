import {firestore} from "firebase-admin";
import {TaskStatus} from "./constants";

export type TTaskData = {
    taskId: string;
    name: string;
    description: string | null;
    user_id: string;
    dueDate: firestore.Timestamp | null;
    createdAt: firestore.Timestamp;
    updatedAt: firestore.Timestamp;
    status: TaskStatus;
};

export type TUserData = {
    name: string;
    email: string;
    description: string | null;
    providerId: string | null;
}
