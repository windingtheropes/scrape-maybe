import scrapeMaybe from ".."
const scraper = new scrapeMaybe(".cache")
import fs from 'fs'
import path from 'path'

scraper.fetchFromWeb('https://launchermeta.mojang.com/mc/game/version_manifest.json', {cache: true, recache: 10000}).then(async (d: any) => {
   
})

