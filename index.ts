import axios, { AxiosError } from 'axios'
import {JSDOM} from 'jsdom'
import fs from 'fs'
import path from 'path'

class scrapeMaybe {
    cache_dir: string;
    constructor(_cache_dir = '.cache') {
        this.cache_dir = _cache_dir
    }

    fetchPage = async (url: string): Promise<string| undefined> => {
        const pageData = await axios
            .get(url)
            .then(res => res.data)
            .catch((error: AxiosError) => {
                console.error(`Error with ${url}`)
                console.error(error.toJSON())
            });
    
        // Check if data is json and was read as object, convert it to string for easy handling
        if(JSON.stringify(pageData)) {
            return JSON.stringify(pageData)
        }
        return pageData;
    }

    fetchFromWeb = async (url: string, cache: boolean = true) => {
        // const data = await fetchPage(url)
    
        const data = (async () => {
            if(cache) {
                if(!fs.existsSync(path.resolve(__dirname, this.cache_dir))) {
                    fs.mkdirSync(path.resolve(__dirname, this.cache_dir))
                }
        
                if(fs.existsSync(path.resolve(__dirname, this.cache_dir, Buffer.from(url).toString('base64')))) {
                    console.log(`🟢 Fetched ${url} from cache.`)
                    return fs.readFileSync(path.resolve(__dirname, this.cache_dir, Buffer.from(url).toString('base64')))            
                } else {
                    console.log(`🟢 Fetched ${url} from the web, and cached.`)
                    let pageData = await this.fetchPage(url)
                    if(pageData) {
                        fs.writeFileSync(path.resolve(__dirname, this.cache_dir, Buffer.from(url).toString('base64')), pageData)      
                        return pageData
                    }
                    
                }
            }
            else {
                console.log(`🟢 Fetched ${url} from the web.`)
                let pageData = await this.fetchPage(url)
                return pageData
            }
        })()
        return data
    }
}

export default scrapeMaybe





