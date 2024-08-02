const express = require ("express");
const moment = require ("moment");
const Response = require ("../lib/Response");
const AuditLogs = require ("../db/models/AuditLogs");
const Categories = require ("../db/models/Categories");
const Users = require("../db/models/Users");
const router = express.Router();
const auth = require("../lib/auth")(); //fonksiyon olarak tanımladık.

 router.all("*",auth.authenticate(), (req, res, next) =>{
    next();
});  

/*
1. Audit logs tablosunda işlem yapan kişilerin hangi işlemi kaç kez yaptığını veren bir sorgu.
2. Kategori tablosunda tekil veri sayısı.
3. Sistemde Tanımlı kaç kullanıcı var?
*/


// api/stats/auditlogs
router.post("/auditlogs", async (req, res) => {
    try {

        let body = req.body;
        let filter = {};

        if (typeof body.location === "boolean") filter.location = body.location;

        let result = await AuditLogs.aggregate([
            {$match: filter },
            {$group: {_id: {email: "$email", proc_type: "$proc_type"} , count: {$sum: 1} } },  // emaili getir her getirilen email için 1 arttır. //aynı emailden kaç tane oluşturulmuş.
            {$sort: { coun: -1}} //-1 tersten sırala +1 normal sırala

            //tek bir alana göre filitreleme yapılacaksa tek { } yeterli.
        ]);

        res.json(Response.successResponse(result));

    } catch (err) {
        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);

    }
        

});

// api/stats/categories/unique
router.post("/categories/unique", async (req, res) => {
    try {
        
        let body = req.body;
        let filter = {};

        if (typeof body.is_active === "boolean") filter.is_active = body.is_active; // istenilen koşullar sağlanıyorsa sadece istenilen yerlerde filitreleme yapılır.

        let result = await Categories.distinct("name", {is_active: true});

        res.json(Response.successResponse({result, count: result.length}));

    } catch (err) {
        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);

    }
        

});

// api/stats/users/count
// /api/stats/users/count
router.post("/users/count", async (req, res) => {
    try {
        let body = req.body;
        let filter = {};

        if (typeof body.is_active === "boolean") filter.is_active = body.is_active;

        let result = await Users.countDocuments(filter);

        res.json(Response.successResponse(result));
    } catch (err) {
        let errorResponse = Response.errorResponse(err, req.user?.language);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;
//req bize gönderilen isteği barındırır, resp gelen req verilecek cevabı barındırır, next başka bir routera geçişini sağlar.