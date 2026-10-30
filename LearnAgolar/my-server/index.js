// const express=require("express")
// const app=express()
// const port=3000
// //create default API
// app.get("/",(req,res)=>{   // tạo api mặc định, khi kh cso gì hết thì heienj 6
//     res.send("Hello Restful API")
// })
// app.get("/about",(req,res)=>{ // lắng nghe port 3000
//     res.send("About Us")
// })
// app.listen(port,()=>{ // lắng nghe port 3000
//     console.log(`My Server listening on port ${port}`)
// })

const express=require("express")
const app=express()
const port=3000
const morgan=require("morgan")
app.use(morgan("combined"))

const path=require("path")
const fs = require('fs');
app.use(express.static(path.join(__dirname,"public")))

const cors=require("cors")
app.use(cors())
const bodyParser=require("body-parser")
//app.use(bodyParser.json())
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

//create default API
app.get("/",(req,res)=>{
    res.send("Hello Restful API")    
})
const databasePath = path.join(__dirname, "books.json")
const initialDatabase = [
    {"BookId":"b1","BookName":"Kỹ thuật lập trình cơ bản","Price":70,"Image":"images/b1.png"},
    {"BookId":"b2","BookName":"Kỹ thuật lập trình nâng cao","Price":100,"Image":"images/b2.png"},
    {"BookId":"b3","BookName":"Máy học cơ bản","Price":200,"Image":"images/b3.png"},
    {"BookId":"b4","BookName":"Máy học nâng cao","Price":300,"Image":"images/b4.png"},
    {"BookId":"b5","BookName":"Lập trình Robot cơ bản","Price":250,"Image":"images/b5.png"},
]
let database = fs.existsSync(databasePath)
    ? JSON.parse(fs.readFileSync(databasePath, "utf8"))
    : initialDatabase
if (!fs.existsSync(databasePath)) {
    fs.writeFileSync(databasePath, JSON.stringify(database, null, 2))
}
app.get("/books",(req,res)=>{
    res.send(database)
})
app.get("/books/:id",cors(),(req,res)=>{
    id=req.params["id"]
    let p=database.find(x=>x.BookId==id)
    res.send(p)    
})
// ============================================
// API Lọc sách theo khoảng giá (min/max)
// URL Gọi: http://localhost:3000/books/filter/price?min=250&max=300
// ============================================
app.get("/books/filter/price", cors(), (req, res) => {
    // 1. Lấy giá trị min và max từ Query String
    let minPrice = req.query.min;
    let maxPrice = req.query.max;
    // 2. Kiểm tra tính hợp lệ của tham số
    if (!minPrice || !maxPrice) {
        return res.status(400)
                  .send("Vui lòng cung cấp đầy đủ tham số ?min=...&max=...");
    }
    // 3. Ép kiểu về số và thực hiện lọc
    let min = parseFloat(minPrice);
    let max = parseFloat(maxPrice);
    let filteredBooks = database.filter(x => x.Price >= min && x.Price <= max);
    // 4. Trả về kết quả
    res.send(filteredBooks);
});
app.post("/books",cors(),(req,res)=>{   
    let newBook = req.body;
    if (newBook.ImageBase64) {
        // Tách bỏ phần header của Base64 (ví dụ: "data:image/png;base64,")
        const base64Data = newBook.ImageBase64.replace(/^data:image\/\w+;base64,/, "");
        const fileName = `${newBook.BookId}.png`;
        const destPath = path.join(__dirname, 'public', 'images', fileName);
        try {
            // Ghi chuỗi mã hóa thành file ảnh
            fs.writeFileSync(destPath, base64Data, 'base64');
            newBook.Image = `images/${fileName}`;
        } catch (error) {
            return res.status(500).send("Lỗi lưu ảnh Base64");
        }
        delete newBook.ImageBase64;
    } else if (newBook.Image) {
        const imageName = path.basename(String(newBook.Image).replace(/\\/g, "/"));
        newBook.Image = `images/${imageName}`;
    }
    database.push(newBook);
    try {
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
    } catch (error) {
        database.pop();
        return res.status(500).send("Lỗi lưu dữ liệu sách");
    }
    res.status(201).send(database);
})

app.put("/books", cors(), (req, res) => {
    const updatedBook = req.body;
    if (!updatedBook || !updatedBook.BookId) {
        return res.status(400).send("BookId is required");
    }

    const index = database.findIndex(book => book.BookId === updatedBook.BookId);
    if (index === -1) {
        return res.status(404).send("Book not found");
    }

    const previousBook = database[index];
    if (updatedBook.ImageBase64) {
        const imageData = String(updatedBook.ImageBase64);
        const dataUrlMatch = imageData.match(/^data:image\/(\w+);base64,(.+)$/);
        const base64Data = dataUrlMatch ? dataUrlMatch[2] : imageData;
        const extension = dataUrlMatch && dataUrlMatch[1] === "jpeg"
            ? "jpg"
            : dataUrlMatch?.[1] || "png";
        const fileName = `${updatedBook.BookId}.${extension}`;
        const imagesDirectory = path.join(__dirname, "public", "images");

        try {
            fs.mkdirSync(imagesDirectory, { recursive: true });
            fs.writeFileSync(path.join(imagesDirectory, fileName), base64Data, "base64");
            updatedBook.Image = `images/${fileName}`;
        } catch (error) {
            return res.status(500).send("Error saving Base64 image");
        }
    } else {
        updatedBook.Image = previousBook.Image;
    }
    delete updatedBook.ImageBase64;

    database[index] = updatedBook;
    try {
        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));
    } catch (error) {
        database[index] = previousBook;
        return res.status(500).send("Error saving books data");
    }

    res.send(database);
});

app.delete("/books/:id", cors(), (req, res) => {
    const id = req.params.id;
    const updatedDatabase = database.filter(book => book.BookId !== id);

    try {
        fs.writeFileSync(databasePath, JSON.stringify(updatedDatabase, null, 2));
    } catch (error) {
        return res.status(500).send("Error saving books data");
    }

    database = updatedDatabase;
    res.send(database);
});

app.listen(port,()=>{
    console.log(`My Server listening on port ${port}`)
})


