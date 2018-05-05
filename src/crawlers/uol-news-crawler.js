'use strict'

/**************
 * LIBRARIES
 **************/
const puppeteer = require('puppeteer');				// puppeteer: Is a Node library which provides a high-level API to control headless Chrome or Chromium over the DevTools Protocol
const cheerio = require('cheerio')					// cheerio: Fast, flexible & lean implementation of core jQuery designed specifically for the server
const request = require('request-promise-native')	// request: Is designed to be the simplest way possible to make http calls

/**************
 * CLASS
 **************/
class UolNewsCrawler {

	static isCategoryAvailable(category) {
		return UolNewsCrawler.availableCategories.indexOf(category) > -1
	}

	static async fetchNews(category, fromPage = 1, numberPages = 10) {

		// Verify if the chosen category is available
		if(!UolNewsCrawler.isCategoryAvailable(category)) {
			console.error(`[ERROR] [UolNewsCrawler]: Category ${category} unavailable`)
			return null
		}

		// Verify if at least a page has been requested
		if(numberPages <= 0) {
			console.error(`[ERROR] [UolNewsCrawler]: Invalid number of pages`)
			return null
		}

		// Starts puppeteer
		const browser = await puppeteer.launch()
		const page = await browser.newPage()
		await page.goto(`${UolNewsCrawler._getPathFromCategory(category)}/noticias`)

		// Going to the starting page
		for(let i = 1; i < fromPage; i++) {
			await page.click(".next")
			await page.waitFor(1000)
		}

		// Fetch news page from the chosen category
		console.info(`[INFO] [UolNewsCrawler]: Fetching ${numberPages} page(s) starting from page ${fromPage} of '${category}' news feed from ${UolNewsCrawler.url} ...`)
		let start = Date.now()

		// Holds content
		let content = []

		// Iterate over the pages
		for(let currentPage = fromPage; currentPage < fromPage + numberPages; currentPage++) {

			// Evaluate the page
			let body = await page.evaluate(() => {
				return document.body.innerHTML
			})
			body = cheerio.load(body)

			// Stores the links on the feed
			let newsLinks = UolNewsCrawler._getNewsLinks(body)
			console.info(`[INFO] [UolNewsCrawler]: Page ${currentPage} has been fetched (${page.url()})`)

			// // For each of the links found
			// for(let currentNews of newsLinks) {

			// 	// Builds options for the next news
			// 	requestOptions = {
			// 		"uri": currentNews,
			// 		transform: body => cheerio.load(body)
			// 	}

			// 	// Makes request and stores the content
			// 	let tempContent = G1NewsCrawler._getNewsContent(await request(requestOptions))
			// 	tempContent["category"] = category
			// 	content.push(tempContent)

			// }

			console.log(newsLinks)

			console.info(`[INFO] [G1NewsCrawler]: Content from page ${currentPage} retrieved`)

			// Goes to next page
			await page.click(".next")
			await page.waitFor(2000)

		}

		// Prints the time
		let end = Date.now()
		console.info(`[INFO] [UolNewsCrawler]: The fetching has taken ${(end - start) / 1000}s`)
		console.info(`[INFO] [UolNewsCrawler]: ${content.length} news have been fetched`)

		// Closes puppeteer
		await browser.close()

		return content
		
	}

	static _getNewsLinks($) {
		
		// Get all news with the specific class
		let newsFeed = $("section").attr("id", "conteudo-principal")
		

		console.log(newsFeed)

		// Fetch links from the news feed
		let links = []
		for(let i in newsFeed) {

			// Verify if it has a link and is valid
			let tempNews = undefined
			try {
				tempNews = $(newsFeed[i]).attr("href")
			} catch(err) {}

			if(tempNews !== undefined && tempNews.includes("uol.com.br")) {
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
				return UolNewsCrawler.url.replace("noticias", "economia")

			case "health":
			case "science":
				return `${UolNewsCrawler.url}/ciencia-e-saude`

			case "politics":
				return `${UolNewsCrawler.url}/politica`

			case "technology":
				return UolNewsCrawler.url.replace("noticias", "tecnologia")

			case "world":
				return `${UolNewsCrawler.url}/internacional`

			default:
				return null

		}

	}

}

/**************
 * STATIC VARIABLES
 **************/
UolNewsCrawler.url = "https://noticias.uol.com.br"
UolNewsCrawler.availableCategories = [
	"economy",
	"health",
	"science",
	"politics",
	"technology",
	"world"
]

module.exports = UolNewsCrawler
