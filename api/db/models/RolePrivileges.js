const mongoose = require("mongoose");

const schema = mongoose.Schema({
role_id:{ type:mongoose.SchemaTypes.ObjectId, required: true}, //rol tablosundaki _id ye karşılık geliyor
permission:{ type:String, required: true}, // role_privilegesdaki key alanına denk geliyor
created_by:{ type:mongoose.SchemaTypes.ObjectId},
},{
    versionKey: false,
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
});
class RolePrivileges extends mongoose.Model {

}
schema.loadClass(RolePrivileges);
module.exports = mongoose.model("role_privileges",schema)