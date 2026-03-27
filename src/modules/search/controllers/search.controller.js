const fs = require("fs");
const path = require("path");

function safeReadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return [];
  }
}

exports.globalSearch = async (req, res) => {
  const q = String(req.query.q || "").toLowerCase().trim();

  if (!q) {
    return res.json({ success: true, results: [] });
  }

  const dbPath = path.join(process.cwd(), "database.sqlite");

  let results = [];

  try {
    // 🔥 SAMPLE MOCK SEARCH (replace later with real DB queries)

    const sample = [
      { type: "user", name: "ADMIN01", id: "u1" },
      { type: "collection", name: "products", id: "c1" },
      { type: "record", name: "order_001", id: "r1" },
      { type: "file", name: "invoice.pdf", id: "f1" },
      { type: "notification", name: "Backup success", id: "n1" }
    ];

    results = sample.filter(item =>
      item.name.toLowerCase().includes(q)
    );

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }

  res.json({
    success: true,
    query: q,
    count: results.length,
    results
  });
};
