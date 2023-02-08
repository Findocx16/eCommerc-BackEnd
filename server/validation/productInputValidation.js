import Joi from "joi";

//Validates the data passed to it for registering a user. It checks if the following fields are present and meet certain criteria
const addProductValidation = (data) => {
    const schema = Joi.object({
        productName: Joi.string().required().label("Product name"),
        productDescription: Joi.string()
            .required()
            .label("Product description"),
        productPrice: Joi.number().required().label("Product price"),
        stockCount: Joi.number().required().label("Number of stocks"),
    });
    return schema.validate(data);
};

const quantityAddToCartValidation = (data) => {
    const schema = Joi.object({
        quantity: Joi.number().required().label("Quantity"),
    });
    return schema.validate(data);
};

export { addProductValidation, quantityAddToCartValidation };
