 const sendError = (err) => {
     return err
 }

 const sendSuccess = (status, data) => {
     return {
         status: status,
         data: data
     }
 }



 module.exports = {
     sendError,
     sendSuccess
 }