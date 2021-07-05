var express = require('express');
var router = express.Router();
const AttendentService = require('../services/attendent');

router.get("/", async (req, res)=>{
    try {
        let data = await AttendentService.findAttendent()
        if(data){
            return res.status(200).json({
                status: 200,
                message: "thành công",
                data: data
            })
        }
        return res.status(400).json({
            status: 400,
            message: "check lại thông tin",
        })
    } catch (error) {
        return  res.status(500).json({
            status: 500,
            message: "lỗi server"
        })
    }
})
router.get("/:id", async (req, res)=>{
    try {
        let id = req.params.id
        let data = await AttendentService.findAttendentByIdStaff(id)
        if(data){
            return res.status(200).json({
                status: 200,
                message: "thành công",
                data: data
            })
        }
        return res.status(400).json({
            status: 400,
            message: "check lại thông tin",
        })
    } catch (error) {
        return  res.status(500).json({
            status: 500,
            message: "lỗi server"
        })
    }
})
router.get("/findFolowDay/:id", async(req, res)=>{
    try {
        let id = req.params.id;
        let date = req.query.date.split("?")[0]
        console.log(date);
        let data = await AttendentService.findAttendentFolowDay(id, date)
        if(data){
            return res.status(200).json({
                status: 200,
                message: "thành công",
                data: data
            })
        }
        return res.status(400).json({
            status: 400,
            message: "không có bản ghi phù hợp",
        })
    } catch (error) {
        return  res.status(500).json({
            status: 500,
            message: "lỗi server"
        })
    }
})



router.post("/", async (req, res)=>{
    try {
        let data = await AttendentService.createAttendent(req.body)
        if(data){
            return res.status(200).json({
                status: 200,
                message: "tạo bản ghi mới thành công",
                data: data
            })
        }
        return res.status(400).json({
            status: 400,
            message: "sai idUser hoặc date"
        })
    } catch (error) {
       return  res.status(500).json({
        status: 500,
        message: "lỗi server"
    })
    }
})
router.put("/", async (req, res)=>{
    try {
        let data = await AttendentService.updateAttendent(req.body)
        if(!data){
            return res.status(400).json({
                status: 400,
                message: "sai idStaff hoặc date"
            })
        }
        return res.status(200).json({
            status: 200,
            message: "cập nhật thành công",
            data: data
        })
    } catch (error) {
       return  res.status(500).json({
        status: 500,
        message: "lỗi server"
    })
    }
})

module.exports = router