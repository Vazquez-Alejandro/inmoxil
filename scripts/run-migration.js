const { neon } = require('@neondatabase/serverless')
const fs = require('fs')

async function main() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL env required')
  const sql = neon(url)
  const content = fs.readFileSync('src/migrations/010_features.sql', 'utf8')
  await sql.query(content)
  console.log('Migration 010_features.sql OK')
}

main().catch(e => { console.error(e.message); process.exit(1) })
