const roleMiddleware = (...allowedRoles) => {

  return (req, res, next) => {

    try {

      const userRole = req.user?.role;

      if (!userRole) {

        return res.status(401).json({ error: 'Não autenticado' });
      }

      if (!allowedRoles.includes(userRole)) {

        return res.status(403).json({ error: 'Acesso negado' });
      }

      next();
    } catch (error) {
        
      return res.status(403).json({ error: 'Acesso negado' });
    }
  };
};

module.exports = roleMiddleware;