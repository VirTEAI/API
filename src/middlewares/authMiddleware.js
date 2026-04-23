const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  try {

    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {

      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = header.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch {

    return res.status(401).json({ error: 'Token inválido' });
  }
};