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
  const {
    title,
    description,
    difficultyLevel,
    tags,
    visibleTestCases,
    invisibleTestCases,
    startCode,
    referenceSolution,
  } = req.body;
  const { id } = req.params;

  try {
    if (!id) return res.status(400).send("Id Invalid");
    const existingProblem = await Problem.findById(id);
    if (!existingProblem) return res.status(404).send("Id not present in database");

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
    if (tags !== undefined) updateData.tags = tags;

    if (visibleTestCases !== undefined) {
      updateData.visibleTestCases = visibleTestCases.map((tc) => ({
        input: String(tc.input ?? ""),
        output: String(tc.output ?? ""),
        explaination: tc.explaination || tc.explanation || "",
      }));
    }

    if (invisibleTestCases !== undefined) {
      updateData.invisibleTestCases = invisibleTestCases.map((tc) => ({
        input: String(tc.input ?? ""),
        output: String(tc.output ?? ""),
      }));
    }

    if (startCode !== undefined) {
      updateData.startCode = startCode.map((sc) => ({
        language: normalizeLanguage(sc.language),
        initialCode: sc.initialCode || sc.code || "",
      }));
    }

    if (referenceSolution !== undefined) {
      const normalizedRefSol = referenceSolution.map((sol) => ({
        language: normalizeLanguage(sol.language),
        completeCode: sol.completeCode || sol.code || "",
      }));
      updateData.referenceSolution = normalizedRefSol;

      // Validate reference solution against visible test cases
      const testCasesToRun = (updateData.visibleTestCases || existingProblem.visibleTestCases || []);
      if (testCasesToRun.length > 0) {
        for (const { language, completeCode } of normalizedRefSol) {
          const languageId = getLanguageById(language);
          if (!languageId) {
            return res.status(400).json({ error: `Unsupported language: ${language}` });
          }

          const submissions = testCasesToRun.map((testcase) => ({
            source_code: completeCode,
            language_id: languageId,
            stdin: testcase.input != null ? String(testcase.input) : "",
            expected_output: testcase.output != null ? String(testcase.output) : "",
          }));

          const submitResult = await submitBatch(submissions);
          const resultToken = submitResult.map((value) => value.token);
          const testResult = await submitToken(resultToken);

          for (const test of testResult) {
            if (test.status_id != 3) {
              return res.status(400).json({
                error: `Reference solution (${language}) failed visible test cases. Status: ${test.status?.description || test.status_id}`,
              });
            }
          }
        }
      }
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      id,
      { $set: updateData },
      { runValidators: true, new: true },
    );

    res.status(200).json(updatedProblem);
  } catch (err) {
    console.error("updateProblem error:", err);
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
const getProblemForAdmin = async (req, res) => {
  const { id } = req.params;
  try {
    const problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ error: "Problem Not found" });
    res.status(200).json(problem);
  } catch (err) {
    res.status(500).json({ error: "Error: " + err.message });
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
  getProblemForAdmin,
  getAllProblem,
  solvedAllProblemByUser,
  submittedProblem
};
