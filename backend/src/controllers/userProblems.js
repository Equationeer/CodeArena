const {
  normalizeLanguage,
  getLanguageById,
  submitBatch,
  submitToken,
} = require("./../utils/problemUtility");
const axios = require("axios");
const Problem = require("../Models/problem");
const User = require("../Models/user");
const Submission = require("../Models/submissions");

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficultyLevel,
    tags,
    visibleTestCases,
    invisibleTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;
  // console.log(req.body);
  try {
    const normalizedRefSol = (referenceSolution || []).map((sol) => ({
      ...sol,
      language: normalizeLanguage(sol.language),
    }));

    const normalizedStartCode = (startCode || []).map((sc) => ({
      ...sc,
      language: normalizeLanguage(sc.language),
    }));

    for (const { language, completeCode } of normalizedRefSol) {
      const languageId = getLanguageById(language);
      if (!languageId) {
        return res.status(400).json({ error: `Unsupported language in reference solution: ${language}` });
      }

      const submissions = (visibleTestCases || []).map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));
      const submitResult = await submitBatch(submissions);
      const resultToken = submitResult.map((value) => value.token);
      const testResult = await submitToken(resultToken);
      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).json({ error: "Reference solution failed visible test cases" });
        }
      }
    }
    // now everthing is fine then we store in db
    const userProblem = await Problem.create({
      ...req.body,
      startCode: normalizedStartCode,
      referenceSolution: normalizedRefSol,
      problemCreator: req.user._id,
    });
    res.status(201).send("Problem saved successfully");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to create problem" });
  }
};
const updateProblem = async (req, res) => {
  // console.log(req.body);
  const {
    title,
    description,
    difficultyLevel,
    tags,
    visibleTestCases,
    invisibleTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;
  const { id } = req.params;
  try {
    if (!id) return res.status(400).send("Id Invalid");
    const IsCorrectId = await Problem.findById(id);
    if (!IsCorrectId) return res.status(404).send("Id not present in database");

    const updateData = { ...req.body };

    if (referenceSolution) {
      const normalizedRefSol = referenceSolution.map((sol) => ({
        ...sol,
        language: normalizeLanguage(sol.language),
      }));
      updateData.referenceSolution = normalizedRefSol;

      const testCasesToRun = visibleTestCases || IsCorrectId.visibleTestCases || [];
      for (const { language, completeCode } of normalizedRefSol) {
        const languageId = getLanguageById(language);
        if (!languageId) {
          return res.status(400).json({ error: `Unsupported language: ${language}` });
        }

        const submissions = testCasesToRun.map((testcase) => ({
          source_code: completeCode,
          language_id: languageId,
          stdin: testcase.input,
          expected_output: testcase.output,
        }));

        const submitResult = await submitBatch(submissions);
        const resultToken = submitResult.map((value) => value.token);
        const testResult = await submitToken(resultToken);
        for (const test of testResult) {
          if (test.status_id != 3) {
            return res.status(400).json({ error: "Reference solution failed visible test cases" });
          }
        }
      }
    }

    if (startCode) {
      updateData.startCode = startCode.map((sc) => ({
        ...sc,
        language: normalizeLanguage(sc.language),
      }));
    }

    const newProblem = await Problem.findByIdAndUpdate(
      id,
      updateData,
      { runValidators: true, new: true },
    );

    res.status(200).json(newProblem);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to update problem" });
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) return res.status(500).send("Invalid Id");
    const isDeleted = await Problem.findByIdAndDelete(id);
    if (!isDeleted) return res.status(404).send("Problem is Missing");
    res.status(200).send("Deleted Successfully");
  } catch (err) {
    res.status(500).send("Error" + err.message);
  }
};
const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    // remember to remove the hidden test case and refernce solution for later don't forget you hidden test case and refernce solutions are visible
    const searchedProblem = await Problem.findById(id).select(
      " title description difficultyLevel tags visibleTestCases startCode referenceSolution ",
    );
    // console.log(searchedProblem);
    if (!searchedProblem) return res.status(404).send("Problem Not found ");
    res.status(200).send(searchedProblem);
  } catch (err) {
    res.status(500).send("Error" + err.message);
  }
};
const getAllProblem = async (req, res) => {
  try {
    // pagination can be added later
    const allProblem = await Problem.find({}).select(
      "_id title difficultyLevel tags",
    );
    if (allProblem.length == 0) return res.status(404).send("No Problem found");
    // console.log(allProblem);
    res.status(200).json(allProblem);
  } catch (err) {
    res.status(500).send("Error" + err.message);
  }
};

const solvedAllProblemByUser=async(req,res)=>{
  try{
    const userId =req.user._id;
    const user=await User.findById(userId).populate({
      path:"problemSolved",
      select:"_id title difficulty tags"
    });
    // console.log(user);
    res.status(200).send(user.problemSolved);
  }catch(err){
    res.status(500).send("Error"+err.message);
  }
}
const submittedProblem=async(req,res)=>{
  try{
      const problemId=req.params.pid;
      const userId=req.user._id;
      const allSubmission = await Submission.find({userId,problemId});
      // console.log(allSubmission);
      res.status(200).send(allSubmission);
  }catch(err){res.status(500).send("Error "+err.message)};
}
module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblem,
  solvedAllProblemByUser,
  submittedProblem
};
