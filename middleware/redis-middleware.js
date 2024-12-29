const redisMiddleware = (req, res, next) => {
    req.redisClient = req.app.locals.redisClient;
    next();
};

export default redisMiddleware;