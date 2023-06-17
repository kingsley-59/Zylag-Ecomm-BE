const { errorResponse } = require("../helpers/apiResponse");
const Message = require("../models/Messagemodel");



exports.sendMessage = async function (req, res) {
    const {id} = req.user;
    const { ad, to } = req.body;

    try {
        const newMessage = new Message({
            from: id,
            to, ad
        });
        await newMessage.save();
    } catch (error) {
        errorResponse(res, error.message);
    }
}