import { Router } from "express";
import {
    userRegistration,
    userLogin,
    userDetails,
    createAdmin,
    viewAuthenticatedOrders,
    viewAllOrders,
    checkOutOrders,
    removeAuthenticatedOrders,
} from "../controllers/userController.js";
import { verify } from "../validation/auth.js";

const router = Router();

router.post("/register", userRegistration);
router.post("/login", userLogin);
router.get("/details", userDetails);
router.patch("/:id/create/admin", verify, createAdmin);
router.get("/orders", verify, viewAuthenticatedOrders);
router.delete("/orders/:id/remove", verify, removeAuthenticatedOrders);
router.get("/allorders", verify, viewAllOrders);
router.patch("/checkout", verify, checkOutOrders);

export default router;
