const express= require("express");
const adminMiddleware=require('../middleware/adminMiddleware')
const {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getProblemForAdmin,
  getAllProblem,
  solvedAllProblemByUser,
  submittedProblem,
} = require("./../controllers/userProblems");
const problemRouter = express.Router();
const userMiddleware = require("../middleware/userMiddleware");

// Problem Create
problemRouter.post("/create", adminMiddleware, createProblem);
//update
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
// delete
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);
// admin view
problemRouter.get("/getProblemForAdmin/:id", adminMiddleware, getProblemForAdmin);
// view
problemRouter.get("/problemById/:id", userMiddleware, getProblemById);
// all view
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);
// solved problem
problemRouter.get("/problemSolvedByUser",userMiddleware,solvedAllProblemByUser);
// all submission
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);

module.exports=problemRouter;