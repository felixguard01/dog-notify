import { createClient } from '@supabase/supabase-js'

const db = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).end()

    const body = req.body

    // LINE ส่ง webhook มาตอน add เพื่อน / ส่งข้อความ → เก็บ user ID
    if (body.events) {
        for (const event of body.events) {
            const userId = event.source?.userId
            if (userId) {
                await db.from('line_users').upsert({ user_id: userId })
            }
        }
        return res.status(200).end()
    }

    // Supabase webhook → ส่งแจ้งเตือน
    const record = body?.record
    const count = record?.count
    if (!count || count % 10 !== 0) return res.status(200).end()

    const token = process.env.LINE_TOKEN

    const { data: users } = await db.from('line_users').select('user_id')
    if (!users?.length) return res.status(200).end()

    await Promise.all(users.map(u =>
        fetch('https://api.line.me/v2/bot/message/push', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: u.user_id,
                messages: [{
                    type: 'text',
                    text: `🐶 เจ้าของกำลังคิดถึงหมา!\nกดไปแล้ว ${count} ครั้งแล้วนะ 🐾`
                }]
            })
        })
    ))

    res.status(200).end()
}
