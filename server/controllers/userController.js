import User from "../models/Users.js";
import Product from "../models/Products.js";
import {
    userRegisterValidation,
    userLoginValidation,
} from "../validation/userInputValidation.js";
import bcrypt from "bcrypt";
import { createAccessToken, decode } from "../validation/auth.js";

async function userRegistration(req, res) {
    const { error } = userRegisterValidation(req.body);

    try {
        //Validate the incoming request body using "userRegisterValidation" function. If the validation fails, it returns a 400 error with the first validation error message.
        if (error)
            return res.status(400).json({ message: error.details[0].message });

        //Check if the provided email is already registered by querying the User collection with the same email.
        const user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(400).json({
                message: "Email is already registered please log in instead",
            });

        //If the email is not registered, it generates a salt using the SALT environment variable and uses bcrypt to hash the password.
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        //Save the new user with the hashed password in the User collection.
        await new User({ ...req.body, password: hashPassword }).save();
        return res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
}

async function userLogin(req, res) {
    const { error } = userLoginValidation(req.body);

    try {
        if (error)
            return res.status(400).json({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Compares the password from the request body to the hashed password stored in the database using the bcrypt library's compareSync function.
        const validPassword = bcrypt.compareSync(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(400).json({ message: "Password incorrect" });

        //If the email and password are valid, it creates a JSON Web Token
        createAccessToken(user);
        return res.status(201).json({ message: createAccessToken(user) });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function userDetails(req, res) {
    const { userId } = decode(req.headers.authorization);

    try {
        //Decodes the JSON Web Token (JWT) passed in the authorization header to extract the user ID
        const user = await User.findById(
            { _id: userId },
            { _id: 0, userCreatedOn: 0, __v: 0 }
        );
        if (!user) return res.status(404).json({ message: "User not found" });
        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function createAdmin(req, res) {
    const { isAdmin } = decode(req.headers.authorization);
    const userId = req.params.id;

    try {
        if (!isAdmin)
            return res
                .status(401)
                .json({ message: "Current user is not authorized" });
        const user = await User.findById({ _id: userId });
        if (!user)
            return res
                .status(404)
                .json({ message: "User not found in the database" });

        //If the user is already an admin, it returns a 400 Bad Request error with a message indicating that the user is already an admin.
        if (user.isAdmin)
            return res
                .status(400)
                .json({ message: `${user.firstName} is currently an admin` });
        user.isAdmin = true;
        await user.save();
        return res
            .status(200)
            .json({ message: `${user.firstName} is now an admin` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function viewAuthenticatedOrders(req, res) {
    const { userId } = decode(req.headers.authorization);

    try {
        if (!userId) return res.status(404).json({ message: "Invalid token" });
        const user = await User.findById(
            { _id: userId },
            { orders: 1, cartTotal: 1 }
        );
        if (!user)
            return res
                .status(404)
                .json({ message: "User not found in the database" });
        if (!user.orders.length)
            return res
                .status(404)
                .json({ message: "No order found, your cart is empty" });
        return res.status(200).json({ orders: user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function viewAllOrders(req, res) {
    const { isAdmin } = decode(req.headers.authorization);

    try {
        if (!isAdmin)
            return res.status(401).json({ message: "User not authorized" });
        const product = await User.find(
            { orders: { $ne: [] } },
            { firstName: 1, lastName: 1, orders: 1 }
        );
        if (!product.length)
            return res
                .status(400)
                .json({ message: "There is no current order in any account" });
        return res.status(200).json({ orders: product });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function checkOutOrders(req, res) {
    const { isAdmin, userId } = decode(req.headers.authorization);

    try {
        if (isAdmin)
            return res
                .status(401)
                .json({ message: "Admin is not authorize to checkout" });
        const user = await User.findById({ _id: userId });
        if (!user)
            return res
                .status(404)
                .json({ message: "User not found in the database" });
        if (!user.orders.length)
            return res
                .status(404)
                .json({ message: "No item in the cart to check out" });

        //Calculates the total amount of all orders, the sum of quantities of all products, and the name of a product.
        let productName;
        for (let i = 0; i < user.orders.length; i++) {
            const order = user.orders[i];
            for (let j = 0; j < order.products.length; j++) {
                productName = order.products[j].productName;
            }
        }

        let total = 0;
        for (let i = 0; i < user.orders.length; i++) {
            const order = user.orders[i];
            total += order.totalAmount;
        }

        let quantitiesSum = 0;
        for (let i = 0; i < user.orders.length; i++) {
            const order = user.orders[i];
            for (let j = 0; j < order.products.length; j++) {
                const product = order.products[j];
                const quantity = parseInt(JSON.stringify(product.quantity));
                quantitiesSum += quantity;
            }
        }

        //Updates the array of the user document by adding an object that contains the product name, quantity, and checkout total.
        user.checkOutDetails.push({
            productName: productName,
            quantity: quantitiesSum,
            checkOutTotal: total,
        });
        const product = await Product.findOne({ productName: productName });
        if (!product)
            return res.status(400).json({
                message: `${product.productName} is not available, please remove this from your cart`,
            });

        //The function then updates the soldCount of the product in the Product collection.
        product.soldCount += quantitiesSum;
        await product.save();

        //Finally, the function removes all items from the user's cart by resetting the orders and cartTotal fields to an empty array and zero, respectively.
        user.orders = [];
        user.cartTotal = 0;
        await user.save();
        return res.status(201).json({
            message:
                "Purchased items will be delivered to your registered address. THANK YOU",
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

async function removeAuthenticatedOrders(req, res) {
    const { userId } = decode(req.headers.authorization);
    const orderId = req.params.id;

    try {
        if (!userId)
            return res.status(401).json({ message: "User not authorized" });

        //Finds the user in the database based on the userId obtained from the decoded token.
        const user = await User.findById({ _id: userId });
        if (!user) return res.status(404).json({ message: "User not found" });

        let total = 0;
        for (let i = 0; i < user.orders.length; i++) {
            const order = user.orders[i];
            if (order.id === orderId) {
                total += order.totalAmount;
            }
        }

        //Finds the order to remove based on the orderId and calculates the total amount of that order.
        const order = user.orders.find((order) => order.id === orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        //Filters the user's orders array and removes the order with the matching id.
        const updatedOrders = user.orders.filter(
            (order) => order.id !== orderId
        );

        if (updatedOrders === []) {
            return res.status(404).json({ message: "Empty cart" });
        }

        //Updates the user's cartTotal by subtracting the total amount of the removed order.
        user.cartTotal -= total;
        user.orders = updatedOrders;
        await user.save();
        return res.status(200).json({ message: "Order successfully removed" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export {
    userRegistration,
    userLogin,
    userDetails,
    createAdmin,
    viewAuthenticatedOrders,
    viewAllOrders,
    checkOutOrders,
    removeAuthenticatedOrders,
};
