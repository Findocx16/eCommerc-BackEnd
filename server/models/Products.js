import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, "Product name is required"],
    },
    productDescription: {
        type: String,
        required: [true, "Product description is required"],
    },
    productPrice: {
        type: Number,
        required: [true, "Product price is required"],
    },
    stockCount: {
        type: Number,
        required: [true, "Number of product is required"],
    },
    listedBy: {
        type: String,
        required: [true, "Admin name is required"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdOn: {
        type: Date,
        default: Date.now,
    },
    soldCount: {
        type: Number,
        default: 0,
    },
    orders: [
        {
            orderId: {
                type: String,
                required: [true, "Order ID is required"],
            },
        },
    ],
});

const Product = mongoose.model("Product", productSchema);
export default Product;
