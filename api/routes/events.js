const express = require ("express");
const router = express.Router();
const { HTTP_CODES } = require ("../config/Enum");
const emitter = require("../lib/Emitter");

emitter.addEmitter("notifications"); //event emiter tanımladık.

router.get("/", async (req, res) => {

        res.writeHead(HTTP_CODES.OK,{
            "Content-Type": "text/event-stream",
            "Connection": "keep-alive",
            "Cache-Control": "no-cash, no-transform"

        });

        const listener = (data) => {
            res.write("data: " + JSON.stringify(data) + "\n\n"); // bir stream oluşturmak için kullanılır. 
        }

        emitter.getEmitter("notifications").on("messages", listener) // emitere gönderilen messagesleri dinlemeye başlarız.

        req.on("close", () =>{
            emitter.getEmitter("notifications").off("messages", listener);  // durdururuz
        })
});


module.exports=router;
//req bize gönderilen isteği barındırır, resp gelen req verilecek cevabı barındırır, next başka bir routera geçişini sağlar.
// bildirim mekanizması oluşturduk emitter ve events sayesinde.