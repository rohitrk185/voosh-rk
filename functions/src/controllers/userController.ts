import {firestore} from "firebase-admin";
import express from "express";
import {TUserData} from "../types";


// Get a reference to the Firestore database
const db = firestore();


export const createUser = async (req: express.Request, res: express.Response) => {
  console.log("in post of user Task");

  const userId = req["user"]?.uid;
  if (!userId) {
    return res.status(401).json({
      message: "User Unauthenticated!",
    });
  }

  const {name, description, email, providerId} = req.body;

  if (!email || String(email).match(/@/g)?.length !== 1 || !name || !String(name).trim()) {
    console.error("Invalid email/username!");
    return res.status(400).json({
      message: "Failed to create user, got invalid Username/Email",
    });
  }

  const usersCollectionRef = db.collection("users");
  const curUserCountSnap = await usersCollectionRef.where("email", "==", email).count().get();

  if (curUserCountSnap.data().count > 0) {
    console.error("Failed to create User. User already exists!");
    return res.status(403).json({
      message: "Failed to create User. User already exists!",
    });
  }

  // let photoUrl = null;
  // try {
  //   const userFromAuth = await admin.auth().getUserByEmail(email);
  //   if (!userFromAuth) {
  //     throw new Error("No such user found!");
  //   }
  //   // photoUrl = userFromAuth.photoURL;
  // } catch (error) {
  //   console.error("Error in checking user from auth!");
  //   return res.status(403).json({
  //     message: "User is required to SignUp before performing this action!",
  //   });
  // }


  const userData: TUserData = {
    name,
    description: description || null,
    email,
    providerId: providerId || null,
  };

  const userSnap = await usersCollectionRef.add(userData);


  return res.status(200).json({
    message: "User created Successfully!",
    data: {
      userId: userSnap.id,
    },
  });
};
