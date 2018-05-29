'use strict'

/**************
 * LIBRARIES
 **************/
const G1NewsCrawler = require("../crawlers/g1-news-crawler")
const UolNewsCrawler = require("../crawlers/uol-news-crawler")

class NewsCrawler {

	static async fetchNews(category, fromPage = 1, numberPages = 10) {
		
		// Instantiates variable to hold content
		let content = []

		/* CRAWLERS */

		// G1
		let tempContent = await G1NewsCrawler.fetchNews(category, fromPage, numberPages)
		if(tempContent !== null) { content = content.concat(tempContent) }

		// Uol
		tempContent = await UolNewsCrawler.fetchNews(category, fromPage, numberPages)
		if(tempContent !== null) { content = content.concat(tempContent) }

		return content

	}

}

module.exports = NewsCrawler
