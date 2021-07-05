var Queue = require('bull');
const fs = require('fs');
const _ = require('lodash')
const { setQueues, BullAdapter } = require('bull-board')
const redisClient = require("../config/redis");
var path = require('path')
var videoQueue = new Queue('video convert', process.env.REDIS_URI);
var imageQueue = new Queue('image delete', process.env.REDIS_URI);
// videoQueue.process(5, path.join(__dirname, '../media/genVideoTom3u8.js'));
videoQueue.on('completed', job => {
    let {idLesson, filePath} = job.data
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
})

videoQueue.on('waiting', async function(jobId){
    //remove Dulicate jon same idLesson
    let allJob = await videoQueue.getJobs()
    let jobTarget = await videoQueue.getJob(jobId)
    let jobDuplicate = allJob.filter(job=>{
        return job.data.idLesson === jobTarget.data.idLesson
    })
    var res = _.map(jobDuplicate, "id");
    res.shift()
    res.forEach(id=>{
        videoQueue.removeJobs(id)
    })
});

imageQueue.process(5, path.join(__dirname, './deleteImageJob.js'));

setQueues([
    new BullAdapter(imageQueue),
    new BullAdapter(videoQueue)
]);

module.exports = {
    videoQueue,
    imageQueue
}