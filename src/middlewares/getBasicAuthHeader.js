
const getBasicAuthHeader = (req, res, next) => {
    if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
        res.status(401).json({ message: 'Missing Basic Authorization Header' });
        return;
    }

    const base64Credentials = req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(":");
    res.locals.email = username;
    res.locals.password = password;
    next();
}

export default getBasicAuthHeader;