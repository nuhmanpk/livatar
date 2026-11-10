// Your own hosted avatar API in 10 lines. Deploy to Cloudflare Workers (or Bun/Deno/Vercel/Netlify).
//   npm i livatar wrangler && npx wrangler deploy
//   https://<your-worker>.workers.dev/animal/ada.svg?mood=happy&size=128
import { avatarHandler } from 'livatar/server'

export default { fetch: avatarHandler({ cacheControl: 'public, max-age=31536000, immutable', maxSize: 1024 }) }
