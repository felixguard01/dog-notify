export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end()

    const record = req.body?.record
    const count = record?.count

    if (!count || count % 10 !== 0) return res.status(200).end()

    const token = process.env.LINE_TOKEN
    const userId = process.env.LINE_USER_ID

    await fetch('https://api.line.me/v2/bot/message/push', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: userId,
            messages: [{
                type: 'text',
                text: `🐶 เจ้าของกำลังคิดถึงหมา!\nกดไปแล้ว ${count} ครั้งแล้วนะ`
            }]
        })
    })

    res.status(200).end()
}
