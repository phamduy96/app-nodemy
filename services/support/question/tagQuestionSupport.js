let TagQuestionSupportModel = require("../../../models/support/question/tagQuestion");

module.exports.createTagQuestionSupport = (data) => {
    return TagQuestionSupportModel.create(data)
}
module.exports.getAllTagQuestionSupport = () => {
    return TagQuestionSupportModel.find()
}