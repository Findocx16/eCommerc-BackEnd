import Joi from "joi";
import JoiPasswordComplexity from "joi-password-complexity";

const userRegisterValidation = (data) => {
    //Validates the data passed to it for registering a user. It checks if the following fields are present and meet certain criteria
    const schema = Joi.object({
        firstName: Joi.string().required().label("First name"),
        lastName: Joi.string().required().label("Last name"),
        email: Joi.string().email().required().label("Email"),
        password: JoiPasswordComplexity().required().label("Password"),
        mobileNo: Joi.number().required().label("Mobile No."),
        address: {
            street: Joi.string().required().label("Street"),
            city: Joi.string().required().label("City"),
            province: Joi.string().required().label("Province"),
            zipcode: Joi.string().required().label("Zipcode"),
        },
    });
    return schema.validate(data);
};

const userLoginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: JoiPasswordComplexity().required().label("Password"),
    });
    return schema.validate(data);
};

export { userRegisterValidation, userLoginValidation };
