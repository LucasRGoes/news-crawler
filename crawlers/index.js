'use strict';

const G1NewsCrawler = require('./g1-news-crawler');		// G1NewsCrawler: Crawler made for https://g1.globo.com/ news extraction.
const CrawlerFactory = require('./crawler-factory');	// CrawlerFactory: Generates crawlers with transparency.

module.exports = {
	G1NewsCrawler: G1NewsCrawler,
	CrawlerFactory: CrawlerFactory
};
