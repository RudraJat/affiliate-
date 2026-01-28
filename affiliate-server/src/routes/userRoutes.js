const express= require('express');
const userController=require("../controller/userController");
const authMiddleware = require("../middleware.authMiddleWare");

const router = express.Router();

router.user(authMiddleware);

router.post("/", userController.create);
router.get("/", userController.getAll);
router.put("/:id", userController.update);
router.delete("/:id", userController.delete);

module.exports = router;