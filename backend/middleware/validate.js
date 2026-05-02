function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || value === '';
    });

    if (missing.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missing
      });
    }

    next();
  };
}

function requirePositiveInteger(field) {
  return (req, res, next) => {
    const value = Number(req.body[field]);

    if (!Number.isInteger(value) || value <= 0) {
      return res.status(400).json({ message: `${field} must be a positive integer` });
    }

    req.body[field] = value;
    next();
  };
}

module.exports = { requireFields, requirePositiveInteger };
