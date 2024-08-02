const { request } = require("express");
const mongoose = require("mongoose");
const RolePrivileges = require("./RolePrivileges");

const schema = mongoose.Schema({
role_name: {type:String, required:true, unique: true },
is_active: {type:Boolean, default:true},
created_by: {
    type: mongoose.SchemaTypes.ObjectId,
    
}

},
{
    versionKey: false,
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
});
class Roles extends mongoose.Model {

    static async deleteMany(query) {
        if (query._id) {
        await RolePrivileges.deleteMany({role_id: query._id}); // eğer bir roll silinirse buna ait olan roleprivilageside sil.
        }
        await super.deleteMany(query);  // super mongodbden geliyor.
        
    }


}

schema.loadClass(Roles);
module.exports = mongoose.model("roles",schema);