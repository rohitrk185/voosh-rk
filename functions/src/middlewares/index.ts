import express from "express";
import admin from "firebase-admin";

// type User = {
//   uid: string;
// }

// Extend the Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken; // Add 'user' property to Request
        // user?: User,
    }
  }
}


/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 * @return {any}
 */
export async function authorizeRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authorizationHeader = req.headers.authorization?.split("Bearer ");
  const jwtToken = authorizationHeader ? authorizationHeader[1] : null;

  console.log("authorizationHeader: ", authorizationHeader);
  console.log("jwtToken: ", jwtToken);

  if (!jwtToken) {
    return res.status(401).json({
      message: "User Unautheticated!",
    });
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(jwtToken);
    console.log("decodedToken: ", decodedToken);
    req["user"] = decodedToken;
    // req["user"] = {
    //   uid:"test-user-rk"
    // };

    return next();
  } catch (error) {
    console.error("Error in authorizing request: ", error);
    return res.status(401).json({
      message: "User Unautheticated!",
    });
  }
}
