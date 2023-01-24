/*สคริปต์ฝั่งเซิร์ฟเวอร์ Node.js ที่ใช้ไลบรารี Express และ Socket.io เพื่อสร้างแบบเรียลไทม์แอปพลิเคชั่นวิดีโอแชท WebRTC */


 /**
 * นำเข้าไลบรารี Express และ uuid และสร้างอินสแตนซ์ของแอปพลิเคชัน Express และเซิร์ฟเวอร์ HTTP
 */
const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

/**
 * นำเข้าโมดูล ExpressPeerServer จากไลบรารีเพียร์และบรรทัดถัดไปสร้างออบเจกต์อ็อพชันที่มีคุณสมบัติการดีบักตั้งค่าเป็นจริง.
 */
const { ExpressPeerServer } = require("peer");
const opinions = {
    debug: true,
}

/**
 * ตั้งค่ากลไกการดูสำหรับแอปพลิเคชัน Express เป็น EJS และบรรทัดถัดไปนำเข้าไลบรารี Socket.io
 และแนบกับเซิร์ฟเวอร์ HTTP คุณสมบัติ cors ใช้เพื่ออนุญาตการเชื่อมต่อจากต้นทาง
 */
app.set("view engine", "ejs");
const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

/**
 * ติดตั้งมิดเดิลแวร์ ExpressPeerServer บนเส้นทาง /peerjs และให้บริการเนื้อหาของไดเร็กทอรีสาธารณะเป็นค่าคงที่
 */

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));


/**
 * สร้างเส้นทางสำหรับ URL รูท และ เปลี่ยนเส้นทางผู้ใช้ไปยังรหัสห้องที่สร้างขึ้นแบบสุ่มสร้างโดย uuidv4()
 */

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});


/**
 * สร้างเส้นทางสำหรับ URL ด้วยพารามิเตอร์ห้องและแสดงมุมมอง room.ejs ด้วยพารามิเตอร์ roomId ที่เข้ามา
 */

app.get("/:room", (req, res) => {
    res.render("room", { roomId: req.params.room });
});



/**
 * รับฟังเหตุการณ์ (การเชื่อมต่อ) จากลูกค้าและเมื่อไคลเอนต์เชื่อมต่อก็จะฟังเหตุการณ์ "เข้าร่วมห้อง"และเข้าร่วมห้องด้วย roomId ที่แน่นอนนอกจากนี้ยังปล่อยเหตุการณ์(เชื่อมต่อกับผู้ใช้) ด้วย userId บางอย่างหลังจาก 1 วินาที นอกจากนี้ยังฟังเหตุการณ์ (ข้อความ) และเมื่อได้รับข้อความ
 มันส่งข้อความและชื่อผู้ใช้ไปยังไคลเอนต์ทั้งหมด
 */
io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        setTimeout(() => {
            socket.to(roomId).broadcast.emit("user-connected", userId);
        }, 1000)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

/**เริ่มต้นเซิร์ฟเวอร์และรับฟังพอร์ตที่ระบุในตัวแปร PORT หรือพอร์ต 3000 หากไม่ได้ตั้งค่าไว้. */
server.listen(process.env.PORT || 3000);

