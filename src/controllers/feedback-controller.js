import ctrlWrapper from "../decorators/ctrlWrapper.js";
import feedbackService from "../services/feedback-service.js";

export const feedback = async (req, res) => {
    const {name, surname, email, phone} = req.body;
    const mailResponse = await feedbackService.feedback(name, surname, email, phone);
    res.status(mailResponse.success ? 200 : 400).json(mailResponse);
}

export default {
    feedback: ctrlWrapper(feedback)
}