const express = require ("express");
const moment = require ("moment");
const Response = require ("../lib/Response");
const AuditLogs = require ("../db/models/AuditLogs");
const router = express.Router();
const auth = require("../lib/auth")(); //fonksiyon olarak tanımladık.

 router.all("*",auth.authenticate(), (req, res, next) =>{
    next();
});  


router.post("/", auth.checkRoles("auditlogs_view"), async (req, res) => {
        try {
             let body= req.body;
             let query= {};
             let skip = parseInt(body.skip) || 0;  // Sayıya çevir ve varsayılan 0
             let limit = parseInt(body.limit) || 500; // Sayıya çevir ve varsayılan 500
     
             if (body.begin_date && body.end_date) {
                query.created_at = {
                    $gte: moment(body.begin_date).toDate(), // JavaScript tarih nesnesi
                    $lte: moment(body.end_date).toDate()    // JavaScript tarih nesnesi
                };

            } else {
                query.created_at = {
                    $gte: moment().subtract(1, "day").startOf("day").toDate(), // JavaScript tarih nesnesi
                    $lte: moment().toDate() // JavaScript tarih nesnesi
                };
            }

            let auditLogs = await AuditLogs.find(query)
            .skip(skip)  // Fonksiyon olarak çağır
            .limit(limit); // Fonksiyon olarak çağır

            res.json(Response.successResponse(auditLogs));

        } catch (err) {
            let errorResponse = Response.errorResponse(err, req.user?.language);
            res.status(errorResponse.code).json(errorResponse);
           

        }

});
module.exports=router;
//req bize gönderilen isteği barındırır, resp gelen req verilecek cevabı barındırır, next başka bir routera geçişini sağlar.