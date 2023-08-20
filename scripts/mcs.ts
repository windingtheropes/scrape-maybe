import scrapeMaybe from ".."
const scraper = new scrapeMaybe(".cache")
import fs from 'fs'
import path from 'path'

scraper.fetchFromWeb('https://launchermeta.mojang.com/mc/game/version_manifest.json').then(async (d: any) => {
    let directory: any = []
    let latest: {snapshot: string, release: string} = {snapshot: '', release: ''}

    if (d) {
        if (JSON.parse(d)) {
            d = JSON.parse(d)

            latest.snapshot = d.latest.snapshot
            latest.release = d.latest.release

            const getVersions = async () => {
                const versions = d.versions
                for (let v of versions) {
                    const metaUrl = v.url
                    const _id = v.id
                    const versionData: any = await scraper.fetchFromWeb(metaUrl)
                    if (JSON.parse(versionData)) {
                        let data = JSON.parse(versionData)
                        const server = data.downloads.server ? data.downloads.server.url : undefined
                        const client = data.downloads.client ? data.downloads.client.url : undefined
                        directory.push({ id: _id, client, server })
                    }
                }
            }
            await getVersions()

            console.log(directory)
            console.log("latest", latest)

            fs.writeFileSync("dump.json", JSON.stringify(directory))
        }
    }
})

