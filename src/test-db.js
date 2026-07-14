const pool = require("./config");

   async function test() {
     try {
       const result = await pool.query("SELECT NOW()");
       console.log("✅ Conexión exitosa:", result.rows[0]);
     } catch (err) {
       console.error("❌ Error de conexión:", err.message);
     } finally {
       await pool.end();
     }
   }

   test();