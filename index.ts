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

    fetchFromWeb = async (url: string, config: {cache: boolean, recache:number} = {cache: true, recache:0}) => {
        // const data = await fetchPage(url)
        const { cache, recache } = config
        const data = (async () => {
            if(cache) {
                if(!fs.existsSync(path.resolve(__dirname, this.cache_dir))) {
                    fs.mkdirSync(path.resolve(__dirname, this.cache_dir))
                }
                
                const cached_path = path.resolve(__dirname, this.cache_dir, Buffer.from(url).toString('base64'))
                if(fs.existsSync(cached_path)) {
                    console.log(`🟣 ${url} exists in cache.`)
                    const cached_mtime = fs.lstatSync(cached_path).mtime.getTime()
                    if(recache > 0) {
                        const time_diff = new Date().getTime() - cached_mtime
                        if(time_diff >= recache) {
                            console.log(`🟣 Cached version of ${url} has expired.`)
                            let pageData = await this.fetchPage(url)
                            if(pageData) {
                                fs.writeFileSync(cached_path, pageData)   
                                console.log(`🟢 Fetched ${url} from the web, and recached.`)
                                return pageData
                            }
                        }
                    }
                    else {
                        console.log(`🟢 Fetched ${url} from cache.`)
                        return fs.readFileSync(cached_path)  
                    }      
                } else {
                    let pageData = await this.fetchPage(url)
                    if(pageData) {
                        fs.writeFileSync(cached_path, pageData)      
                        console.log(`🟢 Fetched ${url} from the web, and cached.`)
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





