const express = require('express');
const router = express.Router();
const StaffServices = require("../services/staff")

router.get("/", async (req, res)=> {
    try {
        let data = await StaffServices.getListStaff()
        if(data){
            return res.status(200).json({
                status: 200,
                message: "lấy dữ liệu thành công",
                data: data
            })
        }
        return res.status(400).json({
            status: 400,
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Không thể kết nối tới server"
        })
    }
})
router.get("/:id", async (req, res)=> {
    try {
        let id = req.params.id;
        let data = await StaffServices.getDetailStaff(id)
        if(data){
            return res.status(200).json({
                status: 200,
                message: "lấy dữ liệu thành công",
                data: data
            })
        }
        return res.status(400).json({
            status: 400,
        })
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: "Không thể kết nối tới server"
        })
    }
})
module.exports = router