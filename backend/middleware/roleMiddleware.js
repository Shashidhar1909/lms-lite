const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403);
            const role = req.user ? req.user.role : 'unknown';
            throw new Error(`User role '${role}' is not authorized to access this route`);
        }
        next();
    };
};

module.exports = { authorize };
