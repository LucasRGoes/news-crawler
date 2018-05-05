'use strict'

/**************
 * LIBRARIES
 **************/
const cheerio = require('cheerio')					// cheerio: Fast, flexible & lean implementation of core jQuery designed specifically for the server
const request = require('request-promise-native')	// request: Is designed to be the simplest way possible to make http calls

/**************
 * CLASS
 **************/
class G1NewsCrawler {

	static isCategoryAvailable(category) {
		return G1NewsCrawler.availableCategories.indexOf(category) > -1
	}

	static async fetchNews(category, fromPage = 1, numberPages = 10) {

		// Verify if the chosen category is available
		if(!G1NewsCrawler.isCategoryAvailable(category)) {
			console.error(`[ERROR] [G1NewsCrawler]: Category ${category} unavailable`)
			return null
		}

		// Verify if at least a page has been requested
		if(numberPages <= 0) {
			console.error(`[ERROR] [G1NewsCrawler]: Invalid number of pages`)
			return null
		}

		// Fetch news page from the chosen category
		console.info(`[INFO] [G1NewsCrawler]: Fetching ${numberPages} page(s) starting from page ${fromPage} of '${category}' news feed from ${G1NewsCrawler.url} ...`)
		let start = Date.now()

		// Holds content
		let content = []

		// Iterate over the pages
		for(let currentPage = fromPage; currentPage < fromPage + numberPages; currentPage++) {

			// Builds options for the next page
			let requestOptions = {
				"uri": `${G1NewsCrawler._getPathFromCategory(category)}/index/feed/pagina-${currentPage}.html`,
				transform: body => cheerio.load(body)
			}

			// Makes request and stores the links on the feed
			let newsLinks = G1NewsCrawler._getNewsLinks(await request(requestOptions))
			console.info(`[INFO] [G1NewsCrawler]: Page ${currentPage} has been fetched (${requestOptions["uri"]})`)

			// For each of the links found
			for(let currentNews of newsLinks) {

				// Builds options for the next news
				requestOptions = {
					"uri": currentNews,
					transform: body => cheerio.load(body)
				}

				// Makes request and stores the content
				let tempContent = G1NewsCrawler._getNewsContent(await request(requestOptions))
				tempContent["category"] = category
				content.push(tempContent)

			}

			console.info(`[INFO] [G1NewsCrawler]: Content from page ${currentPage} retrieved`)

		}

		// Prints the time
		let end = Date.now()
		console.info(`[INFO] [G1NewsCrawler]: The fetching has taken ${(end - start) / 1000}s`)
		console.info(`[INFO] [G1NewsCrawler]: ${content.length} news have been fetched`)

		return content
		
	}

	static _getNewsLinks($) {
		
		// Get all news with the specific class
		let newsFeed = $(".feed-post-link")

		// Fetch links from the news feed
		let links = []
		for(let i in newsFeed) {

			// Verify if it has a link and is valid
			let tempNews = undefined
			try {
				tempNews = $(newsFeed[i]).attr("href")
			} catch(err) {}

			if(tempNews !== undefined) {
				links.push(tempNews)
			}

		}

		return links

	}

	static _getNewsContent($) {
		
		// Initializes a variable to store the content
		let content = {}

		// Getting published time
		let datePublished = $("time").attr("itemprop", "datePublished")
		content["datePublished"] = new Date($(datePublished).attr("datetime")).getTime()

		// Getting modified time
		let dateModified = $("time").attr("itemprop", "dateModified")
		content["dateModified"] = new Date($(dateModified).attr("datetime")).getTime()

		// Getting headline
		let headline = $(".content-head__title").attr("itemprop", "headline")
		content["headline"] = $(headline).text()

		// Getting subtitle
		let subtitle = $(".content-head__subtitle").attr("itemprop", "alternativeHeadline")
		content["subtitle"] = $(subtitle).text()

		// Getting content
		content["content"] = $(".content-text__container").text()

		return content

	}

	/*
	 * getPathFromCategory
	 * 	Gets path to search for news of the chosen category
	 * 
	 *	category {String}: The category to be searched
	 * 
	 *	returns {String}: The path to be used
	 */
	static _getPathFromCategory(category) {

		// Return path from the chosen category
		switch(category) {

			case "economy":
				return `${G1NewsCrawler.url}/economia`

			case "health":
			case "science":
				return `${G1NewsCrawler.url}/ciencia-e-saude`

			case "politics":
				return `${G1NewsCrawler.url}/politica`

			case "technology":
				return `${G1NewsCrawler.url}/tecnologia`

			case "world":
				return `${G1NewsCrawler.url}/mundo`

			default:
				return null

		}

	}

}

/**************
 * STATIC VARIABLES
 **************/
G1NewsCrawler.url = "http://g1.globo.com"
G1NewsCrawler.availableCategories = [
	"economy",
	"health",
	"science",
	"politics",
	"technology",
	"world"
]

module.exports = G1NewsCrawler
