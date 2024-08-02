const express = require ("express");
const router = express.Router();
const Enum = require("../config/Enum");
const Roles = require ("../db/models/Roles");
const RolePrivileges = require("../db/models/RolePrivileges");
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const role_privileges = require("../config/role_privileges");
const config = require("../config");
const auth = require("../lib/auth")(); //end point koruma
const i18n = new (require("../lib/i18n"))(config.DEFAULT_LANG);


router.all("*",auth.authenticate(), (req, res, next) =>{
    next();  // endpoint koruma
});  



router.get("/",auth.checkRoles("role_view"),async(req, res) => {
try {
    let roles = await Roles.find({});

    res.json(Response.successResponse(roles));

} catch (err) {
    let errorResponse = Response.errorResponse(err);
    res.status(errorResponse.code).json(errorResponse);

}

});

router.post("/add",auth.checkRoles("role_add"),async (req, res) =>{
    let body = req.body;
    try {

        if(!body.role_name) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["role_name"]));
        if(!body.permissions || !Array.isArray(body.permissions) || body.permissions.length == 0 ){ 
            throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST,i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_TYPE", req.user.language, ["permissions","Array"]));
            // permissions alanı olmalı bir dizi olmalı ve içeriisnde en az bir elaman olmalı. yoksa hata fırlat || yada demek.
        }
        
        
            let role = new Roles({
            role_name: body.role_name,
            is_active: true,
            created_by: req.user?.id //eğer req.user değeri yoksa null dön varsa onu getir.

        });

        await role.save();

        for(let i=0;i<body.permissions.length;i++){
            let priv = new RolePrivileges({
                role_id: role._id,
                permission: body.permissions[i],
                created_by:req.user?.id
            });

            await priv.save(); // db kayıt
        }

        res.json(Response.successResponse({success: true}));


    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);


    } 
});

router.post("/update",auth.checkRoles("role_update"),async (req, res) =>{
    let body = req.body;
    try {

        if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["_id"]));

        let updates = {};

        if(body.role_name) updates.role_name = body.role_name;
        if(typeof body.is_active==="boolean") updates.is_active = body.is_active; //body.is activeyi updates is activeye ata.
        
        if(body.permissions && Array.isArray(body.permissions) && body.permissions.length > 0 ) { // body permsiison var ve bir dizi ve lenghtide 0 dan büyükse çalıştır.  
            
            let permissions = await RolePrivileges.find({role_id: body._id});
            //body.permissions => ["category_view","user_add"]
            //permissions => [{role_id:"abc",permission: "user_add",_id: "bcd"}]
            
            let deleteManydPermissions = permissions.filter(x => !body.permissions.includes(x.permission)); // body.permision içinde yoksa bunu deleteManyd permissona ata.
            let newPermissions = body.permissions.filter(x => !permissions.map(p => p.permission).includes(x));
            
            if (deleteManydPermissions.length > 0) {
                await RolePrivileges.deleteMany({_id : {$in : deleteManydPermissions.map(x => x._id)}}); //id değeri deleteManyd permssion dizisindeki id lerden biriyse onu sil
            }
            
            if (newPermissions.length > 0){
                for(let i=0;i<body.permissions.length;i++){
                    let priv = new RolePrivileges({
                        role_id: body._id,
                        permission: body.permissions[i],
                        created_by:req.user?.id
                    });
                    await priv.save();

            }
        }
    }

        await Roles.updateOne({_id: body._id}, updates);

        res.json(Response.successResponse({success: true}));


    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);


    } 
});

router.post("/delete",auth.checkRoles("role_delete"),async (req, res) =>{
    let body = req.body;
    try {

        if(!body._id) throw new CustomError(Enum.HTTP_CODES.BAD_REQUEST, i18n.translate("COMMON.VALIDATION_ERROR_TITLE", req.user.language), i18n.translate("COMMON.FIELD_MUST_BE_FILLED", req.user.language, ["_id"]));

        await Roles.deleteMany({_id: body._id});

        res.json(Response.successResponse({success: true}));


    } catch (err) {
        let errorResponse = Response.errorResponse(err);
        res.status(errorResponse.code).json(errorResponse);


    } 
});

router.get("/role_privileges", async (req, res) => {
    res.json(role_privileges);
});

module.exports = router;