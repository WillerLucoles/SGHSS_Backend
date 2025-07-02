// src/middlewares/validate.js


export default (schema) => (req, res, next) => {

  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      msg: e.message,
    }));
    return res.status(400).json({ errors });
  }
  req.body = result.data;
  next();
};