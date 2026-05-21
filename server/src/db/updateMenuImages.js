import { query, closePool } from './pool.js'

const IMAGE_UPDATES = [
  { id: 'americano-ice', image_url: '/americano-ice.png' },
  { id: 'americano-hot', image_url: '/americano-hot.png' },
  { id: 'cafe-latte', image_url: '/caffe-latte.png' },
]

async function main() {
  for (const { id, image_url } of IMAGE_UPDATES) {
    const result = await query(
      `UPDATE menus SET image_url = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, image_url`,
      [image_url, id],
    )
    if (result.rowCount === 0) {
      console.warn(`Menu not found: ${id}`)
    } else {
      console.log(`${result.rows[0].name}: ${result.rows[0].image_url}`)
    }
  }
  await closePool()
  console.log('Menu images updated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
