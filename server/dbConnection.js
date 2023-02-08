import mongoose from "mongoose";

const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

export default () => {
    return new Promise((resolve, reject) => {
        mongoose
            .connect(
                process.env.DB,
                connectionParams,
                mongoose.set("strictQuery", false)
            )
            .then(() => {
                console.log("Connected to Atlas");
                resolve();
            })
            .catch((error) => {
                console.log("Connection Error", error);
                reject(error);
            });
    });
};
