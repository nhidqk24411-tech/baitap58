const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 4000;

app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const mongoUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'FashionData';
const collectionName = 'Fashion';

let client;
let database;
let fashionCollection;

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

// Khởi tạo kết nối MongoDB và chuẩn hóa dữ liệu mẫu
async function initDB() {
  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    database = client.db(dbName);
    fashionCollection = database.collection(collectionName);
    console.log(`Connected successfully to MongoDB database: ${dbName}`);

    // Kiểm tra và chuẩn hóa dữ liệu
    const count = await fashionCollection.countDocuments();
    console.log(`Current items in collection Fashion: ${count}`);

    // Cập nhật các bản ghi chưa có created_at, title, detail, thumbnail, IdF, slug
    const docs = await fashionCollection.find({}).toArray();
    let baseTime = Date.now() - (docs.length * 3600 * 1000 * 24);

    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      const updates = {};
      
      const title = doc.title || doc.fashion_subject || 'Untitled Fashion';
      const detail = doc.detail || doc.fashion_detail || '';
      const thumbnail = doc.thumbnail || doc.fashion_image || '';
      const style = doc.style || 'STREET STYLE';
      const createdAt = doc.created_at ? new Date(doc.created_at) : new Date(baseTime + (i * 3600 * 1000 * 24));
      const idf = doc.IdF !== undefined ? Number(doc.IdF) : (i + 1);
      const slug = generateSlug(title, idf);

      if (!doc.title || doc.title !== title) updates.title = title;
      if (!doc.fashion_subject || doc.fashion_subject !== title) updates.fashion_subject = title;
      if (!doc.detail || doc.detail !== detail) updates.detail = detail;
      if (!doc.fashion_detail || doc.fashion_detail !== detail) updates.fashion_detail = detail;
      if (!doc.thumbnail || doc.thumbnail !== thumbnail) updates.thumbnail = thumbnail;
      if (!doc.fashion_image || doc.fashion_image !== thumbnail) updates.fashion_image = thumbnail;
      if (!doc.style || doc.style !== style) updates.style = style;
      if (!doc.created_at) updates.created_at = createdAt.toISOString();
      if (doc.IdF === undefined || doc.IdF !== idf) updates.IdF = idf;
      if (!doc.slug || doc.slug !== slug) updates.slug = slug;

      if (Object.keys(updates).length > 0) {
        await fashionCollection.updateOne({ _id: doc._id }, { $set: updates });
      }
    }
    console.log('FashionData normalized successfully with unique IdF and SEO slugs.');
  } catch (err) {
    console.error('Error connecting or seeding MongoDB:', err);
  }
}

// 1. API kiểm tra server
app.get('/', (req, res) => {
  res.send('Fashion RESTful API Server is running on port ' + port);
});

// 2. API lấy danh sách tất cả các Style duy nhất
app.get('/fashions/styles', async (req, res) => {
  try {
    const styles = await fashionCollection.distinct('style');
    const filtered = styles.filter(s => s && s.trim().length > 0);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. API trả về toàn bộ Fashion, sắp xếp theo ngày tạo giảm dần
app.get('/fashions', async (req, res) => {
  try {
    const { style } = req.query;
    let query = {};
    if (style && style.trim().length > 0 && style !== 'ALL') {
      query.style = { $regex: new RegExp(`^${style.trim()}$`, 'i') };
    }

    const results = await fashionCollection
      .find(query)
      .sort({ created_at: -1, _id: -1 })
      .toArray();

    // Map chuẩn hóa dữ liệu trả về đầy đủ các trường bao gồm IdF và slug
    const mapped = results.map((item, index) => {
      const title = item.title || item.fashion_subject || '';
      const idf = item.IdF !== undefined ? Number(item.IdF) : (results.length - index);
      return {
        _id: item._id,
        IdF: idf,
        title: title,
        fashion_subject: title,
        detail: item.detail || item.fashion_detail || '',
        fashion_detail: item.fashion_detail || item.detail || '',
        thumbnail: item.thumbnail || item.fashion_image || '',
        fashion_image: item.fashion_image || item.thumbnail || '',
        style: item.style || '',
        slug: item.slug || generateSlug(title, idf),
        created_at: item.created_at || new Date().toISOString()
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. API lọc danh sách các Fashion theo 1 Style nào đó
app.get('/fashions/style/:style', async (req, res) => {
  try {
    const targetStyle = req.params.style.trim();
    const query = { style: { $regex: new RegExp(`^${targetStyle}$`, 'i') } };
    const results = await fashionCollection
      .find(query)
      .sort({ created_at: -1, _id: -1 })
      .toArray();

    const mapped = results.map((item, index) => {
      const title = item.title || item.fashion_subject || '';
      const idf = item.IdF !== undefined ? Number(item.IdF) : (results.length - index);
      return {
        _id: item._id,
        IdF: idf,
        title: title,
        fashion_subject: title,
        detail: item.detail || item.fashion_detail || '',
        fashion_detail: item.fashion_detail || item.detail || '',
        thumbnail: item.thumbnail || item.fashion_image || '',
        fashion_image: item.fashion_image || item.thumbnail || '',
        style: item.style || '',
        slug: item.slug || generateSlug(title, idf),
        created_at: item.created_at || new Date().toISOString()
      };
    });

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5a. API trả về Fashion dựa vào slug (Tự động phân tích Slug để trích xuất IdF hoặc BaseSlug)
app.get('/fashions/slug/:slug', async (req, res) => {
  try {
    const slugParam = req.params.slug.trim();
    
    // Tự động phân tích (parse) chuỗi slug
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

    // 1. Tìm chính xác theo slug đã lưu
    let item = await fashionCollection.findOne({ slug: slugParam });

    // 2. Nếu có IdF trích xuất được từ slug, tìm theo IdF
    if (!item && extractedIdF !== null) {
      item = await fashionCollection.findOne({ IdF: extractedIdF });
    }

    // 3. Nếu chưa thấy, duyệt danh sách so khớp linh hoạt
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
      return res.status(404).json({ error: 'Fashion not found for slug: ' + slugParam });
    }

    const title = item.title || item.fashion_subject || '';
    const idf = item.IdF !== undefined ? Number(item.IdF) : (extractedIdF || 1);
    const mapped = {
      _id: item._id,
      IdF: idf,
      title: title,
      fashion_subject: title,
      detail: item.detail || item.fashion_detail || '',
      fashion_detail: item.fashion_detail || item.detail || '',
      thumbnail: item.thumbnail || item.fashion_image || '',
      fashion_image: item.fashion_image || item.thumbnail || '',
      style: item.style || '',
      slug: item.slug || generateSlug(title, idf),
      created_at: item.created_at || new Date().toISOString()
    };

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5b. API trả về một Fashion dựa vào ObjectId (gọi chung là id)
app.get('/fashions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }
    const item = await fashionCollection.findOne(query);
    if (!item) {
      return res.status(404).json({ error: 'Fashion not found' });
    }

    const title = item.title || item.fashion_subject || '';
    const idf = item.IdF !== undefined ? Number(item.IdF) : 1;
    const mapped = {
      _id: item._id,
      IdF: idf,
      title: title,
      fashion_subject: title,
      detail: item.detail || item.fashion_detail || '',
      fashion_detail: item.fashion_detail || item.detail || '',
      thumbnail: item.thumbnail || item.fashion_image || '',
      fashion_image: item.fashion_image || item.thumbnail || '',
      style: item.style || '',
      slug: item.slug || generateSlug(title, idf),
      created_at: item.created_at || new Date().toISOString()
    };

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. API thêm mới một Fashion
app.post('/fashions', async (req, res) => {
  try {
    const body = req.body;
    const title = body.title || body.fashion_subject || 'Untitled Fashion';
    const detail = body.detail || body.fashion_detail || '';
    const thumbnail = body.thumbnail || body.fashion_image || '';
    const style = body.style || 'STREET STYLE';
    const createdAt = body.created_at || new Date().toISOString();
    
    // Tự động gán IdF cao nhất + 1 để không bao giờ trùng lặp
    const maxDoc = await fashionCollection.find({ IdF: { $exists: true } }).sort({ IdF: -1 }).limit(1).toArray();
    let nextIdF = 1;
    if (maxDoc.length > 0 && maxDoc[0].IdF) {
      nextIdF = Number(maxDoc[0].IdF) + 1;
    }
    const idf = body.IdF !== undefined ? Number(body.IdF) : nextIdF;
    const slug = body.slug || generateSlug(title, idf);

    const newDoc = {
      IdF: idf,
      title,
      fashion_subject: title,
      detail,
      fashion_detail: detail,
      thumbnail,
      fashion_image: thumbnail,
      style,
      slug,
      created_at: createdAt
    };

    const result = await fashionCollection.insertOne(newDoc);
    newDoc._id = result.insertedId;
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. API chỉnh sửa một Fashion
app.put('/fashions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const current = await fashionCollection.findOne(query);
    const title = body.title || body.fashion_subject || (current ? (current.title || current.fashion_subject) : '');
    const detail = body.detail !== undefined ? body.detail : body.fashion_detail;
    const thumbnail = body.thumbnail !== undefined ? body.thumbnail : body.fashion_image;
    const style = body.style;
    const idf = body.IdF !== undefined ? Number(body.IdF) : (current ? current.IdF : 1);

    const updateFields = {
      updated_at: new Date().toISOString()
    };

    if (body.IdF !== undefined) {
      updateFields.IdF = Number(body.IdF);
    }
    if (title !== undefined) {
      updateFields.title = title;
      updateFields.fashion_subject = title;
      updateFields.slug = generateSlug(title, idf);
    }
    if (detail !== undefined) {
      updateFields.detail = detail;
      updateFields.fashion_detail = detail;
    }
    if (thumbnail !== undefined) {
      updateFields.thumbnail = thumbnail;
      updateFields.fashion_image = thumbnail;
    }
    if (style !== undefined) {
      updateFields.style = style;
    }

    await fashionCollection.updateOne(query, { $set: updateFields });
    const updated = await fashionCollection.findOne(query);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hỗ trợ cả PUT /fashions với _id trong body
app.put('/fashions', async (req, res) => {
  try {
    const body = req.body;
    const id = body._id;
    if (!id) {
      return res.status(400).json({ error: 'Missing _id in request body' });
    }
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const current = await fashionCollection.findOne(query);
    const title = body.title || body.fashion_subject || (current ? (current.title || current.fashion_subject) : '');
    const detail = body.detail !== undefined ? body.detail : body.fashion_detail;
    const thumbnail = body.thumbnail !== undefined ? body.thumbnail : body.fashion_image;
    const style = body.style;
    const idf = body.IdF !== undefined ? Number(body.IdF) : (current ? current.IdF : 1);

    const updateFields = {
      updated_at: new Date().toISOString()
    };

    if (body.IdF !== undefined) {
      updateFields.IdF = Number(body.IdF);
    }
    if (title !== undefined) {
      updateFields.title = title;
      updateFields.fashion_subject = title;
      updateFields.slug = generateSlug(title, idf);
    }
    if (detail !== undefined) {
      updateFields.detail = detail;
      updateFields.fashion_detail = detail;
    }
    if (thumbnail !== undefined) {
      updateFields.thumbnail = thumbnail;
      updateFields.fashion_image = thumbnail;
    }
    if (style !== undefined) {
      updateFields.style = style;
    }

    await fashionCollection.updateOne(query, { $set: updateFields });
    const updated = await fashionCollection.findOne(query);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. API xóa một Fashion dựa vào id
app.delete('/fashions/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let query;
    try {
      query = { _id: new ObjectId(id) };
    } catch {
      query = { _id: id };
    }

    const itemToDelete = await fashionCollection.findOne(query);
    if (!itemToDelete) {
      return res.status(404).json({ error: 'Fashion not found to delete' });
    }

    await fashionCollection.deleteOne(query);
    res.json({ message: 'Deleted successfully', deleted: itemToDelete });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Khởi chạy Server
app.listen(port, async () => {
  console.log(`Server-Fashion running on http://localhost:${port}`);
  await initDB();
});
