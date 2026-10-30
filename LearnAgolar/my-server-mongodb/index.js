const express = require('express');
const app = express();
const port = 3002;
const crypto = require('crypto');
const REMEMBER_DURATION = 30 * 24 * 60 * 60 * 1000;
const SESSION_DURATION = 8 * 60 * 60 * 1000;
const configuredJwtSecret = process.env.JWT_SECRET;
if (configuredJwtSecret && Buffer.byteLength(configuredJwtSecret) < 32) {
    throw new Error('JWT_SECRET must be at least 32 bytes.');
}
if (!configuredJwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a secret of at least 32 bytes in production.');
}
const JWT_SECRET = configuredJwtSecret || crypto.randomBytes(32).toString('hex');
if (!configuredJwtSecret) {
    console.warn('JWT_SECRET is not set; using a temporary development secret. Set JWT_SECRET to keep login sessions valid across restarts.');
}

function hashAccessToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(user, expiresIn) {
    const now = Math.floor(Date.now() / 1000);
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
        sub: user._id.toString(),
        username: user.username,
        role: user.role,
        jti: crypto.randomBytes(16).toString('hex'),
        iat: now,
        exp: now + Math.floor(expiresIn / 1000)
    })).toString('base64url');
    const content = `${header}.${payload}`;
    const signature = crypto.createHmac('sha256', JWT_SECRET).update(content).digest('base64url');
    return `${content}.${signature}`;
}

function verifyAccessToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
        return null;
    }

    const [headerPart, payloadPart, signaturePart] = parts;
    const content = `${headerPart}.${payloadPart}`;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(content).digest();
    const actualSignature = Buffer.from(signaturePart, 'base64url');
    if (actualSignature.length !== expectedSignature.length ||
        !crypto.timingSafeEqual(actualSignature, expectedSignature)) {
        return null;
    }

    try {
        const header = JSON.parse(Buffer.from(headerPart, 'base64url').toString('utf8'));
        const payload = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
        if (!header || typeof header !== 'object' ||
            !payload || typeof payload !== 'object' ||
            header.alg !== 'HS256' || header.typ !== 'JWT' ||
            typeof payload.sub !== 'string' ||
            typeof payload.exp !== 'number' ||
            payload.exp <= Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload;
    } catch (error) {
        if (error instanceof SyntaxError) {
            return null;
        }
        throw error;
    }
}

function getBearerToken(req) {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/);
    return match ? match[1] : null;
}

function hashPassword(password, salt) {
    return crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex');
}

function verifyPassword(password, salt, expectedHash) {
    const actualHash = Buffer.from(hashPassword(password, salt), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    return actualHash.length === expected.length &&
        crypto.timingSafeEqual(actualHash, expected);
}

const morgan=require("morgan")
app.use(morgan("combined"))

const path=require("path")
const fs = require('fs');
app.use(express.static(path.join(__dirname,"public")))

const cors=require("cors")
//app.use(cors())
app.use(cors({
    origin: 'http://localhost:4200', 
    credentials: false
}));

const bodyParser=require("body-parser")
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.listen(port,()=>{
    console.log(`My Server listening on port ${port}`)
})

app.get("/",(req,res)=>{
    res.send("This Web server is processed for MongoDB")
})
const { MongoClient, ObjectId } = require('mongodb');
const { log } = require('console');
client = new MongoClient("mongodb://127.0.0.1:27017");
client.connect();
database = client.db("FashionData");      
fashionCollection = database.collection("Fashion");

// Helper tạo slug tiếng Việt chuẩn SEO kèm IdF duy nhất
function generateSlug(text, idf) {
    if (!text) return idf ? String(idf) : '';
    let str = text.toLowerCase().trim();
    str = str.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
    str = str.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
    str = str.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
    str = str.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
    str = str.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
    str = str.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
    str = str.replace(/đ/gi, 'd');
    str = str.replace(/[^a-z0-9\s-]/g, '');
    str = str.replace(/\s+/g, '-');
    str = str.replace(/-+/g, '-');
    str = str.replace(/^-+|-+$/g, '');
    if (idf !== undefined && idf !== null && idf > 0) {
        const suffix = `-${idf}`;
        if (!str.endsWith(suffix)) {
            return str ? `${str}${suffix}` : `${idf}`;
        }
    }
    return str;
}

app.get("/fashions/styles", cors(), async (req, res) => {
    try {
        const styles = await fashionCollection.distinct("style");
        res.send(styles.filter(s => s && s.trim().length > 0));
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/fashions", cors(), async (req, res) => {
    const { style } = req.query;
    let query = {};
    if (style && style.trim().length > 0 && style !== 'ALL') {
        query.style = { $regex: new RegExp(`^${style.trim()}$`, 'i') };
    }
    const result = await fashionCollection.find(query).toArray();
    res.send(result);
});

// Endpoint tự động phân tích Slug để trích xuất IdF và hiển thị chính xác Fashion Detail
app.get("/fashions/slug/:slug", cors(), async (req, res) => {
    try {
        const slugParam = req.params.slug.trim();
        let extractedIdF = null;
        let baseSlug = slugParam.toLowerCase();

        const trailingMatch = slugParam.match(/^(.*?)-(\d+)$/);
        const leadingMatch = slugParam.match(/^(\d+)-(.*)$/);
        if (trailingMatch) {
            extractedIdF = parseInt(trailingMatch[2], 10);
            baseSlug = trailingMatch[1].toLowerCase();
        } else if (leadingMatch) {
            extractedIdF = parseInt(leadingMatch[1], 10);
            baseSlug = leadingMatch[2].toLowerCase();
        } else if (/^\d+$/.test(slugParam)) {
            extractedIdF = parseInt(slugParam, 10);
        }

        // 1. Tìm chính xác theo slug
        let item = await fashionCollection.findOne({ slug: slugParam });

        // 2. Tìm theo IdF kiểu số đã bóc tách từ slug
        if (!item && extractedIdF !== null) {
            item = await fashionCollection.findOne({ IdF: extractedIdF });
        }

        // 3. Tìm theo baseSlug
        if (!item) {
            const allDocs = await fashionCollection.find({}).toArray();
            item = allDocs.find((doc, idx) => {
                const docIdF = doc.IdF !== undefined ? Number(doc.IdF) : (allDocs.length - idx);
                if (extractedIdF !== null && docIdF === extractedIdF) return true;
                const docSlug = doc.slug || generateSlug(doc.fashion_subject || doc.title || '', docIdF);
                return docSlug.toLowerCase() === slugParam.toLowerCase() ||
                       docSlug.toLowerCase().startsWith(baseSlug);
            });
        }

        if (!item) {
            return res.status(404).send({ error: "Không tìm thấy Fashion với slug: " + slugParam });
        }
        res.send(item);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get("/fashions/:id", cors(), async (req, res) => {
    try {
        var o_id = new ObjectId(req.params["id"]);
        const result = await fashionCollection.find({_id: o_id}).toArray();    
        res.send(result[0]);
    } catch {
        const result = await fashionCollection.find({_id: req.params["id"]}).toArray();
        res.send(result[0]);
    }
});

app.post("/fashions", cors(), async (req, res) => {
    // Tự động gán Cột IdF kiểu số không trùng nhau (max(IdF) + 1)
    const maxDoc = await fashionCollection.find({ IdF: { $exists: true } }).sort({ IdF: -1 }).limit(1).toArray();
    let nextIdF = 1;
    if (maxDoc.length > 0 && maxDoc[0].IdF) {
        nextIdF = Number(maxDoc[0].IdF) + 1;
    }
    const idf = req.body.IdF !== undefined && req.body.IdF !== null ? Number(req.body.IdF) : nextIdF;
    const title = req.body.fashion_subject || req.body.title || 'Thời Trang Mới';
    const slug = req.body.slug || generateSlug(title, idf);

    const docToInsert = {
        ...req.body,
        IdF: idf,
        slug: slug,
        title: title,
        fashion_subject: title,
        detail: req.body.detail || req.body.fashion_detail || '',
        fashion_detail: req.body.fashion_detail || req.body.detail || '',
        thumbnail: req.body.thumbnail || req.body.fashion_image || '',
        fashion_image: req.body.fashion_image || req.body.thumbnail || '',
        created_at: req.body.created_at || new Date().toISOString()
    };

    await fashionCollection.insertOne(docToInsert);
    res.send(docToInsert);
});

app.put("/fashions", cors(), async (req, res) => {
    const title = req.body.fashion_subject || req.body.title || '';
    const idf = req.body.IdF !== undefined ? Number(req.body.IdF) : 1;
    const slug = req.body.slug || generateSlug(title, idf);

    await fashionCollection.updateOne(
        { _id: new ObjectId(req.body._id) },
        { 
            $set: {
                style: req.body.style,
                fashion_subject: title,
                title: title,
                fashion_detail: req.body.fashion_detail,
                detail: req.body.fashion_detail,
                fashion_image: req.body.fashion_image,
                thumbnail: req.body.fashion_image,
                IdF: idf,
                slug: slug,
                updated_at: new Date().toISOString()
            } 
        }
    );
    var o_id = new ObjectId(req.body._id);
    const result = await fashionCollection.find({_id: o_id}).toArray();    
    res.send(result[0]);
});

app.delete("/fashions/:id", cors(), async (req, res) => {
    try {
        var o_id = new ObjectId(req.params["id"]);
        const result = await fashionCollection.find({_id: o_id}).toArray(); 
        await fashionCollection.deleteOne({_id: o_id});
        res.send(result[0]);
    } catch {
        const result = await fashionCollection.find({_id: req.params["id"]}).toArray();
        await fashionCollection.deleteOne({_id: req.params["id"]});
        res.send(result[0]);
    }
});
app.post('/user-login', async (req, res) => {
    const UserCollection = database.collection("User");
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
        return res.status(400).send({ message: "Username and password are required." });
    }

    const user = await UserCollection.findOne({ username });
    let passwordIsValid = false;
    if (user?.passwordSalt && user?.passwordSha256) {
        passwordIsValid = verifyPassword(password, user.passwordSalt, user.passwordSha256);
    } else if (typeof user?.password === 'string' && user.password === password) {
        const passwordSalt = crypto.randomBytes(16).toString('hex');
        await UserCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    passwordSalt,
                    passwordSha256: hashPassword(password, passwordSalt)
                },
                $unset: { password: "" }
            }
        );
        passwordIsValid = true;
    }

    if (user && passwordIsValid) {
        const expiresIn = req.body.rememberMe === true ? REMEMBER_DURATION : SESSION_DURATION;
        const expiresAt = new Date(Date.now() + expiresIn);
        const token = signAccessToken(user, expiresIn);
        await UserCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    accessTokenHash: hashAccessToken(token),
                    accessTokenExpiresAt: expiresAt
                }
            }
        );
        res.status(200).send({ 
            message: "Login successful!",
            tokenType: "Bearer",
            accessToken: token,
            expiresAt,
            user: { username: user.username, role: user.role }
        });
    } else {
        res.status(401).send({ message: "Wrong user or email!" });
    }   
});
app.get('/user-session', async (req, res) => {
    const token = getBearerToken(req);
    if (!token) {
        return res.status(401).send({ message: "A valid Bearer token is required." });
    }

    const claims = verifyAccessToken(token);
    if (!claims) {
        return res.status(401).send({ message: "Bearer token expired or invalid." });
    }

    const UserCollection = database.collection("User");
    const user = await UserCollection.findOne({
        _id: new ObjectId(claims.sub),
        accessTokenHash: hashAccessToken(token),
        accessTokenExpiresAt: { $gt: new Date() }
    });
    if (!user) {
        return res.status(401).send({ message: "Bearer token expired or invalid." });
    }

    res.status(200).send({
        user: { username: user.username, role: user.role }
    });
});

app.post('/user-logout', async (req, res) => {
    const token = getBearerToken(req);
    if (token) {
        const claims = verifyAccessToken(token);
        if (!claims) {
            return res.status(401).send({ message: "Bearer token expired or invalid." });
        }

        const UserCollection = database.collection("User");
        await UserCollection.updateOne(
            { _id: new ObjectId(claims.sub), accessTokenHash: hashAccessToken(token) },
            {
                $unset: {
                    accessTokenHash: "",
                    accessTokenExpiresAt: ""
                }
            }
        );
    } else {
        return res.status(401).send({ message: "A valid Bearer token is required." });
    }

    res.status(200).send({ message: "Logout successful." });
});
