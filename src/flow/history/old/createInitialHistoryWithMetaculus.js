import { mongoRead, upsert } from "../mongo-wrapper.js"

let createInitialHistory = async () => {
    let metaforecasts = await mongoRead("metaforecasts")
    let metaforecastsHistorySeed = metaforecasts.map(element => {
        // let moreoriginsdata = element.author ? ({author: element.author}) : ({})
        return ({
            title: element.title,
            url: element.url,
            platform: element.platform,
            moreoriginsdata: element.moreoriginsdata || {},
            description: element.description,
            history: [{
                timestamp: element.timestamp,
                options: element.options,
                qualityindicators: element.qualityindicators
            }],
            extra: element.extra || {}
         })
    })
    console.log(metaforecastsHistorySeed)
    await upsert(metaforecastsHistorySeed, "metaforecast_history")

}
createInitialHistory()