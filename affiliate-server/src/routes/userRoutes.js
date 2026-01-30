const express= require('express');
const userController=require("../controller/userController");
// const authMiddleware = require("../middleware.authMiddleWare");
const authorize = require("../middleware/authorizedMiddleware");

const router = express.Router();

// router.user(authMiddleware);

router.post("/", authorize('user: create'), userController.create);
router.get("/", authorize('user: read'), userController.getAll);
router.put("/:id", authorize('user: update'), userController.update);
router.delete("/:id", authorize('user: delete'), userController.delete);

module.exports = router;