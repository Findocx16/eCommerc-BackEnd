import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    province: {
        type: String,
        required: true,
    },
    zipcode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        default: "Philippines",
    },
});

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Firstname is required"],
    },
    lastName: {
        type: String,
        required: [true, "Lastname is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    mobileNo: {
        type: String,
        required: [true, "Mobile No. is required"],
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    userCreatedOn: {
        type: Date,
        default: Date.now,
    },
    address: addressSchema,
    orders: [
        {
            products: [
                {
                    productName: {
                        type: String,
                        required: [true, "Product name is required"],
                    },
                    quantity: {
                        type: Number,
                        required: [true, "Quantity is required"],
                    },
                },
            ],
            totalAmount: {
                type: Number,
                default: 0,
            },
            placedOrderOn: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    cartTotal: {
        type: Number,
        default: 0,
    },
    checkOutDetails: [
        {
            productName: {
                type: String,
                required: [true, "Product name is required"],
            },
            quantity: {
                type: Number,
                required: [true, "Quantity is required"],
            },
            checkOutTotal: {
                type: Number,
                default: 0,
            },
            paidOn: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});
const User = mongoose.model("User", userSchema);

export default User;
