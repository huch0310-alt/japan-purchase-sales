const { Client } = require("pg");
const bcrypt = require("bcryptjs");

async function updatePassword() {
  const client = new Client({
    host: "japan-sales-postgres",
    database: "japan_purchase_sales",
    user: "postgres",
    password: "postgres123"
  });

  try {
    await client.connect();
    const hash = bcrypt.hashSync("customer123", 10);
    console.log("Generated hash:", hash);

    const res = await client.query(
      "UPDATE customers SET passwordHash = $1 WHERE username = $2 RETURNING id, username",
      [hash, "c001"]
    );
    console.log("Update result:", res.rows);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.end();
  }
}

updatePassword();