var attendOnTime = (attendance) => {
    return attendData = attendance.filter((attendancedItem) => {
        return attendancedItem.attend == 1 && attendancedItem.date !== null
    })
}

var attendLate = (attendance) => {
    return attendData = attendance.filter((attendancedItem) => {
        return attendancedItem.attend == 2 && attendancedItem.date !== null
    })
}

var noAttendance = (attendance) => {
    return attendData = attendance.filter((attendancedItem) => {
        return attendancedItem.attend == 0 && attendancedItem.date !== null
    })
}

module.exports = {  
    attendOnTime,
    attendLate,
    noAttendance
}