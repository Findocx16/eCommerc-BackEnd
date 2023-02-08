import User from "../models/Users.js";
import Product from "../models/Products.js";
import { decode } from "../validation/auth.js";
import {
    addProductValidation,
    quantityAddToCartValidation,
} from "../validation/productInputValidation.js";

async function addProduct(req, res) {
    const { error } = addProductValidation(req.body);
    const { isAdmin, fullName } = decode(req.headers.authorization);

    try {
        //Validate user input
        if (error)
            return res.status(400).json({ message: error.details[0].message });

        //Decode the authorization header to check if the user making the request is an admin.
        if (!isAdmin)
            return res.status(401).json({ message: "User is not authorized" });

        const product = await Product.findOne({
            productName: req.body.productName,
        });

        //Check if a product with the same name already exists in the database.
        if (product)
            return res.status(400).json({
                message: "Item is already listed, just add some stocks.",
            });

        //Save a new product to the database using the request body data and the seller's name.
        await new Product({ ...req.body, listedBy: fullName }).save();

        //Return a response to the client with either a success or error message.
        return res.status(200).json({ message: "Product added successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function disableStockCountZero() {
    //Queries the database for all products with a stock count of 0.
    const products = await Product.find({ stockCount: 0 });
    if (products.length > 0) {
        //If any such products are found, it iterates through them.
        for (const product of products) {
            //Saves the updated product in the database.
            product.isActive = false;
            await product.save();
        }
    }
}

async function viewActiveProducts(req, res) {
    try {
        //Calls the disableStockCountZero function to disable any products with a stock count of 0.
        await disableStockCountZero();

        //Queries the database for all products.
        const user = await Product.find({});
        if (!user.length)
            //If no products are found, it returns a response with a "No product found, please add one" error message.
            return res
                .status(404)
                .json({ message: "No product found, please add one" });

        //Queries the database for all active products.
        const userActive = await Product.find(
            { isActive: true },
            {
                _id: 0,
                productName: 1,
                productDescription: 1,
                productPrice: 1,
                stockCount: 1,
            }
        );

        //If no active products are found, it returns a response with a "No active product found" error message.
        if (!userActive.length)
            return res.status(404).json({ message: "No active product found" });

        //If active products are found, it returns a response with a JSON object containing the active products.
        res.status(200).json({ activeProducts: userActive });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function viewSpecificProduct(req, res) {
    const productID = req.params.id;

    try {
        //Queries the database for a product with the specified ID.
        const product = await Product.findById(
            { _id: productID },
            {
                _id: 0,
                productName: 1,
                productDescription: 1,
                productPrice: 1,
                stockCount: 1,
            }
        );
        //If the product is not found, it returns a response with a "Product unavailable." error message.
        if (!product)
            return res.status(404).json({ message: "Product unavailable." });

        //If the product is found, it returns a response with a JSON object containing the product details.
        res.status(200).json({ product: product });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function updateProduct(req, res) {
    const { isAdmin } = decode(req.headers.authorization);
    const productID = req.params.id;

    try {
        //Verifies if the user is authorized. If the user is not authorized, it returns a response with an error message.
        if (!isAdmin)
            return res.status(401).json({ message: "User is not authorized" });

        //Filters the request body to only keep valid fields to update the product.
        const updates = {};
        Object.entries(req.body).forEach(([key, value]) => {
            if (
                [
                    "productName",
                    "productDescription",
                    "productPrice",
                    "stockCount",
                    "listedBy",
                    "isActive",
                ].includes(key)
            ) {
                updates[key] = value;
            }
        });

        //Queries the database for a product with the specified ID and updates it with the filtered fields.
        const product = await Product.findOneAndUpdate(
            { _id: productID },
            updates,
            { new: true }
        );

        //If the product is not found, it returns a response with a "Product not found" error message.
        if (!product)
            return res.status(404).json({ message: "Product not found" });

        //If the product is updated successfully, it returns a response with a message indicating the updated product.
        return res
            .status(200)
            .json({ message: `${product.productName} updated` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
async function archiveProduct(req, res) {
    const { isAdmin } = decode(req.headers.authorization);
    const productID = req.params.id;

    try {
        //Decode the authorization header to check if the user is authorized (an admin)
        if (!isAdmin)
            return res.status(401).json({ message: "User is not authorized" });

        //Extract the product ID from the request parameters

        //Look for the product using the ID in the database
        const product = await Product.findById({ _id: productID });
        if (!product)
            return res.status(404).json({ message: "Product not found." });

        //Check if the product is already archived (isActive is set to false)
        if (!product.isActive)
            return res.status(400).json({
                message: `${product.productName} is already archived`,
            });

        //If not archived, set isActive to false and save the product
        product.isActive = false;
        await product.save();
        return (
            res
                .status(200)
                //Return a success message indicating the product has been archived
                .json({
                    message: `${product.productName} archived successfully`,
                })
        );
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
async function unArchiveProduct(req, res) {
    const productID = req.params.id;
    const { isAdmin } = decode(req.headers.authorization);

    try {
        //Decode the authorization header to check if the user is authorized (admin).
        if (!isAdmin)
            return res.status(401).json({ message: "User is not authorized" });

        //Search for the product with the given ID.
        const product = await Product.findById({ _id: productID });
        if (!product)
            return res.status(404).json({ message: "Product not found." });

        //Check if the product is already active or not.
        if (product.isActive)
            return res.status(400).json({
                message: `${product.productName} is already active`,
            });

        //If the product is not active, change its isActive property to true and save it.
        product.isActive = true;
        await product.save();
        return res
            .status(200)
            .json({ message: `${product.productName} activated successfully` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
async function addToCart(req, res) {
    const { error } = quantityAddToCartValidation(req.body);
    const productID = req.params.id;
    const { isAdmin, userId } = decode(req.headers.authorization);

    try {
        //Validates the quantity in the request body
        if (error)
            return res.status(400).json({ message: error.details[0].message });

        //Verifies that the user is not an admin
        if (isAdmin)
            return res.status(400).json({ message: "Non-admin user only" });

        const product = await Product.findById({ _id: productID });
        if (!product)
            return res.status(404).json({ message: "Product not found." });

        if (product.stockCount == 0) {
            product.isActive = false;
            await product.save();
            return res
                .status(400)
                .json({ message: "Item is currently unavailable." });
        }

        //If the requested quantity is greater than the available stock, returns a 400 error with a message indicating the available stock
        if (product.stockCount < req.body.quantity)
            return res.status(400).json({
                message: `Not enough stocks, available at the moment is ${product.stockCount}`,
            });

        //Finds the user in the database by their id
        const user = await User.findById({ _id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        //Searches for an order in the user's "orders" array that contains the product
        const orderIndex = user.orders.findIndex((order) =>
            order.products.some((p) => p.productName === product.productName)
        );

        //If the order is not found, pushes a new order to the user's "orders" array containing the product and the requested quantity
        if (orderIndex === -1) {
            user.orders.push({
                products: [
                    {
                        productName: product.productName,
                        quantity: req.body.quantity,
                    },
                ],
                totalAmount: product.productPrice * req.body.quantity,
            });
        } else {
            //If the order is found, updates the product's quantity in the order
            user.orders[orderIndex].products.find(
                (p) => p.productName === product.productName
            ).quantity += req.body.quantity;

            user.orders[orderIndex].totalAmount +=
                product.productPrice * req.body.quantity;
        }
        //Adds the total cost of the product to the user's "cartTotal"
        user.cartTotal += product.productPrice * req.body.quantity;
        await user.save();

        //Deducts the requested quantity from the product's "stockCount"
        product.stockCount -= req.body.quantity;

        //Adds the user's id to the product's "orders" array
        product.orders.push({ orderId: userId });
        await product.save();
        return res.status(200).json({
            message: `${product.productName} is added to cart`,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export {
    addProduct,
    viewActiveProducts,
    viewSpecificProduct,
    updateProduct,
    archiveProduct,
    unArchiveProduct,
    addToCart,
};
