import { getRequest } from "../helpers/requests.js";

const authMiddleware = async (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      throw new Error("Unauthorized. Missing auth token.");
    }
    const jwt = bearerToken.slice(7, bearerToken.length);
    const url = `${process.env.AUTH_SERVICE_API}/verify`;
    const verify = await getRequest(url, jwt);
    req.userId = verify.id;
    if (!verify.id) {
      throw new Error("Invalid token.");
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(404);
    res.json({ error: err.message });
  }
};

export default authMiddleware;
