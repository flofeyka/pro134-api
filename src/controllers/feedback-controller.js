import ctrlWrapper from "../decorators/ctrlWrapper.js";
import feedbackService from "../services/feedback-service.js";

export const feedback = async (req, res) => {
    const {name, question} = req.body;
    const mailResponse = await feedbackService.feedback(name, question);
    res.status(mailResponse.success ? 200 : 400).json(mailResponse);
}

export default {
    feedback: ctrlWrapper(feedback)
}