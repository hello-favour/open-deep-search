import { COLLECTION_AUTHORIZATIONS } from "./Utils/Constants/Collections";

const admin = require("firebase-admin");

export const Middleware = async (req, res, next) => {
    try {
        const apiKey = req.headers.authorization.split("Bearer ")[1];

        if (!apiKey) {
            return res
                .status(403)
                .send({ status: 1, message: "A API key is required" });
        }

        const authorizationDocument = await admin.firestore().collection(COLLECTION_AUTHORIZATIONS).doc(apiKey).get();

        let currentUser = await admin.auth().getUser(userId);

        if (!authorizationDocument.exists || !currentUser || currentUser.disabled) {
            return res.status(403).send({
                status: 1,
                message: "You are not authorized to make this request!",
            });
        }

        req.body.token = currentUser.uid;
        req.query.token = currentUser.uid;
        req.body.user = currentUser;

    } catch (e) {
        console.log(e);
        return res.status(403).send({
            status: 1,
            message: "You are not authorized to make this request!",
            error: e,
        });
    }
    return next();
};
