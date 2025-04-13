import fs from 'fs'
import path from 'path'
import https from 'https'
import { JSDOM } from 'jsdom'

const DATA_DIR = 'public/data'
const URL = 'https://www2-lib.ndhu.edu.tw/persons-in-lib.asp'

fs.mkdirSync(DATA_DIR, { recursive: true })

https.get(URL, (res) => {
    let html = ''
    res.on('data', chunk => html += chunk)
    res.on('end', () => {
        const dom = new JSDOM(html)
        const count = parseInt(dom.window.document.body.textContent.trim(), 10)

        const now = new Date()
        const dateStr = now.toISOString().slice(0, 10)
        const timestamp = now.toISOString()
        const dataPath = path.join(DATA_DIR, `${dateStr}.json`)

        let data = []
        if (fs.existsSync(dataPath)) {
            data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
        }
        data.push({ timestamp, count })
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2))

        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && f !== 'dates.json')
        const dates = files.map(f => f.replace('.json', '')).sort()
        fs.writeFileSync(path.join(DATA_DIR, 'dates.json'), JSON.stringify(dates, null, 2))

        console.log(`✔ ${timestamp} - ${count} people`)
    })
}).on('error', err => {
    console.error('❌ Fetch error:', err)
})
