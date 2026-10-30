const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://127.0.0.1:27017');
  await client.connect();
  const col = client.db('FashionData').collection('Fashion');

  const refItem1 = await col.findOne({ style: 'STREET STYLE' });
  const refItem2 = await col.findOne({ style: 'TRENDS' });

  const exists1 = await col.findOne({ title: /Shows in London/i });
  if (!exists1 && refItem1) {
    const max = await col.find().sort({ IdF: -1 }).limit(1).toArray();
    const nextIdF = (max[0]?.IdF || 11) + 1;
    await col.insertOne({
      IdF: nextIdF,
      title: 'Phil Oh’s Best Street Style Photos From the Fall 2023 Shows in London',
      fashion_subject: 'Phil Oh’s Best Street Style Photos From the Fall 2023 Shows in London',
      detail: '<h3>Eclectic British Style Takes Over London Fashion Week</h3><p>Phil Oh lands in London to capture the most eccentric, innovative, and layered street style across the British fashion capital. From tailored trenches to punk-inspired tartan accents and sculptural outerwear, explore how London sets the trend curve for Autumn/Winter 2023.</p><ul><li><strong>Layering:</strong> Bold neon knitwear combined with vintage shearling</li><li><strong>Footwear:</strong> Heavy-duty lug sole Chelsea boots and classic oxfords</li><li><strong>Accessories:</strong> Sculpted wool berets and cross-body micro bags</li></ul><p>Witness London’s fearless creativity in every frame captured right outside Somerset House and 180 The Strand.</p>',
      fashion_detail: '<h3>Eclectic British Style Takes Over London Fashion Week</h3><p>Phil Oh lands in London to capture the most eccentric, innovative, and layered street style across the British fashion capital.</p>',
      thumbnail: refItem1.thumbnail || refItem1.fashion_image,
      fashion_image: refItem1.fashion_image || refItem1.thumbnail,
      style: 'STREET STYLE',
      slug: 'phil-ohs-best-street-style-photos-from-the-fall-2023-shows-in-london-' + nextIdF,
      created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    });
    console.log('Added Street Style London');
  }

  const exists2 = await col.findOne({ title: /Decade Ago/i });
  if (!exists2 && refItem2) {
    const max = await col.find().sort({ IdF: -1 }).limit(1).toArray();
    const nextIdF = (max[0]?.IdF || 12) + 1;
    await col.insertOne({
      IdF: nextIdF,
      title: 'What Street Style Looked Like a Decade Ago',
      fashion_subject: 'What Street Style Looked Like a Decade Ago',
      detail: '<h3>A Nostalgic Look Back: Street Style in 2013 vs 2023</h3><p>A decade ago, street style was undergoing its golden age renaissance. Neon statement necklaces, Isabel Marant wedge sneakers, peplum tops, and galaxy-print leggings dominated every fashion blogger’s wardrobe outside the Lincoln Center in New York.</p><blockquote>"Street style wasn’t just about what was on the runway—it was about real individuals remixing garments with audacity, DIY customization, and personal flair."</blockquote><p>Fast forward ten years: today’s street style favors oversized quiet luxury, archival vintage Helmut Lang, and gender-fluid tailoring. Here is how the fashion landscape evolved across ten unforgettable years.</p>',
      fashion_detail: '<h3>A Nostalgic Look Back: Street Style in 2013 vs 2023</h3><p>A decade ago, street style was undergoing its golden age renaissance.</p>',
      thumbnail: refItem2.thumbnail || refItem2.fashion_image,
      fashion_image: refItem2.fashion_image || refItem2.thumbnail,
      style: 'TRENDS',
      slug: 'what-street-style-looked-like-a-decade-ago-' + nextIdF,
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    });
    console.log('Added Decade Ago');
  }

  const total = await col.countDocuments();
  console.log('New total in MongoDB:', total);

  const styleCounts = await col.aggregate([
    { $group: { _id: '$style', count: { $sum: 1 } } }
  ]).toArray();
  console.log('Style counts:', styleCounts);

  await client.close();
}

run().catch(console.error);
