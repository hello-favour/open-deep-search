const admin = require("firebase-admin");
const { COLLECTION_AUTHORIZATIONS } = require("./Utils/Constants/Collections");

const Middleware = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        const notAuthorized = {
            status: 1,
            message: "You are not authorized to make this request!",
        };

        if (authorization) {
            const apiKey = req.headers.authorization.split("Bearer ")[1];

            if (!apiKey) {
                return res
                    .status(403)
                    .send({
                        status: 1,
                        message: "A API key is required"
                    });
            }

            const authorizationDocument = await admin.firestore().collection(COLLECTION_AUTHORIZATIONS).doc(apiKey).get();
            const userId = authorizationDocument.data().userId;

            let currentUser = await admin.auth().getUser(userId);


            if (!authorizationDocument.exists || !currentUser || currentUser.disabled) {
                return res.status(403).send(notAuthorized);
            }

            req.body.token = currentUser.uid;
            req.query.token = currentUser.uid;
            req.body.user = currentUser;
        } else {
            return res.status(403).send(notAuthorized);
        }

    } catch (e) {
        console.log(e);
        return res.status(403).send(Object.assign(notAuthorized, { error: e }));
    }

    return next();
};


module.exports = {
    Middleware,
}