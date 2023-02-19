import { Router } from "express";
import {
    addProduct,
    viewActiveProducts,
    viewSpecificProduct,
    updateProduct,
    archiveProduct,
    unArchiveProduct,
    addToCart,
    changeQuantityOrder,
    viewAllProducts,
    deleteProduct,
} from "../controllers/productController.js";
import { verify } from "../validation/auth.js";

const router = Router();

router.post("/addproduct", verify, addProduct);
router.get("/", viewActiveProducts);
router.get("/all", viewAllProducts);
router.get("/:id", viewSpecificProduct);
router.patch("/:id/update", verify, updateProduct);
router.delete("/:id/delete", verify, deleteProduct);
router.patch("/:id/archive", verify, archiveProduct);
router.patch("/:id/unarchive", verify, unArchiveProduct);
router.post("/:id/addtocart", verify, addToCart);
router.patch("/:id/edit", verify, changeQuantityOrder);

export default router;
