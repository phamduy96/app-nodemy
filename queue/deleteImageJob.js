const fs = require('fs')
const path = require('path')

function deleteListImage(job) {
    let {listImage} = job.data
    let listProcessDeleteImage = []
    for(let i = 0 ; i < listImage.length; i++){
        let image = listImage[i]
        let indexSubString = image.indexOf("public/uploads/questionSupport")
        let filePath = path.join(__dirname, '../', image.substring(indexSubString))

        if (fs.existsSync(filePath)) {
            let deletedPromise = new Promise((resolve, reject)=>{
                fs.unlink(filePath, (err) => {
                    if (err) return reject(err);
                    return resolve("Deleted");
                });
            })
            listProcessDeleteImage.push(deletedPromise)
        }
    }

    return Promise.all(listProcessDeleteImage)
}

module.exports = deleteListImage