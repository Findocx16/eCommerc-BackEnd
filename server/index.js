import express from "express";
import cors from "cors";
import { config } from "dotenv";
import dbConnection from "./dbConnection.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";

const app = express();
config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/products", productRoutes);

const port = process.env.PORT || 4000;

dbConnection()
    .then(() => {
        app.listen(port, () => console.log(`Listening on port ${port}...`));
    })
    .catch((error) => {
        console.error("Error in starting server", error);
    });
