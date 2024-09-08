const validate = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(
        { ...req.body, ...req.files },
        {
          abortEarly: false,
          allowUnknown: true,
        }
      );
      next();
    } catch (error) {
      res.status(400).json({
        message: error.details.map((err) => err.message).join(", "),
        success: false,
      });
    }
  };
};
export default validate;
