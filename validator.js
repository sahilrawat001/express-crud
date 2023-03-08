const Joi = require("joi");



const signup = Joi.object().keys({
  name: Joi.string().min(4).required(),
  mail: Joi.string().email({ tlds: { allow: ['com', 'in', 'net'] } }).lowercase().required(),
  // password: Joi.string().alphanum().regex(/^(?=.+\d)(?=.+[a-z])(?=.+[A-Z]).{6,20}$/).required(),
  password: Joi.string().required(),
  asign: Joi.array().required(),
  role: Joi.string().valid("s", "t").required()
});
const updateData = Joi.object().keys({
  name: Joi.string().min(4),
  mail: Joi.string().email({ tlds: { allow: ['com', 'in', 'net'] } }).lowercase(),
  password: Joi.string().alphanum().regex(/^(?=.+\d)(?=.+[a-z])(?=.+[A-Z]).{6,20}$/),
});
const marksUpdateSchema = Joi.object().keys({
  id: Joi.number().required(),
  marks: Joi.number().integer().min(1).max(100).required()

});
module.exports = { signup, updateData, marksUpdateSchema };