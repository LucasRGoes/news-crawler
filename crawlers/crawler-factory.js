'use strict';

/* REQUIRES */
const G1NewsCrawler = require('./g1-news-crawler');	// G1NewsCrawler: Crawler made for https://g1.globo.com/ news extraction.

/* CLASS */
class CrawlerFactory {

	static createCrawler(source) {

		switch(source) {

			case 'g1': return new G1NewsCrawler();
			default: return new G1NewsCrawler();

		}

	}

}

module.exports = CrawlerFactory;
