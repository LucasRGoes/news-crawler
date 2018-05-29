'use strict';

/* REQUIRES */
const cheerio = require('cheerio');					// Cheerio: Fast, flexible & lean implementation of core jQuery designed specifically for the server.
const request = require('request-promise-native');	// Request: The simplified HTTP request client 'request' with Promise support.
const winston = require('winston');					// Winston: A logger for just about everything.

/* CLASS */
class G1NewsCrawler {

	constructor() {

		this._logger = winston.createLogger({
			format: winston.format.simple(),
			transports: [
				new winston.transports.Console()
			]
		});

	}

	categoryAvailable(category) {
		return this.categories.indexOf(category) > -1;
	}

	async fetchNews(category, fromPage = 1, numberPages = 10) { // jshint ignore:line

		/* Verifying variables */
		if(!this.categoryAvailable(category)) {
			throw TypeError( `category ${category} not available` );
		}

		if(fromPage <= 0) {
			throw RangeError( `pages can only go from 1 to ${this.lastPage}` );
		}

		if(fromPage + (numberPages - 1) > this.lastPage) {
			throw RangeError( `requested pages after the last one: ${this.lastPage}` );
		}

		// Starting crawler
		this._logger.info( `Fetching ${numberPages} page(s) starting from page ${fromPage} of '${category}' news feed from ${this.url} ...` );
		const started = Date.now();

		let news = new Set();
		const transformFunction = body => cheerio.load(body);
		for(let currentPage = fromPage; currentPage < fromPage + numberPages; currentPage++) {

			// Options for page requesting
			let requestOptions = {
				uri: `${this._categoryUrl(category)}/index/feed/pagina-${currentPage}.html`,
				transform: transformFunction
			};

			// Parses links within the page
			const links = this._parseLinks( await request(requestOptions) ); // jshint ignore:line
			this._logger.info( `Page ${currentPage} has been fetched, found ${links.size} news links` );

			for(let link of links) {
			
				// URI for link requesting
				requestOptions.uri = link;

				try {
					// Parses content within the news
					const parsedNews = this._parseNews( await request(requestOptions) ); // jshint ignore:line
					parsedNews.category = category;
					news.add(parsedNews);
				} catch(error) {
					this._logger.error( `${link} couldn't have its contents fetched`, error );
				}

			}

			this._logger.info( `All news links from page ${currentPage} have been fetched` );

		}

		// Ending crawler
		const ended = Date.now();
		this._logger.info( `The crawler has taken ${(ended - started) / 1000}s` );
		this._logger.info( `${news.size} news have been fetched` );

		return news;

	}

	get categories() {
		return ['economy', 'health&science', 'politics', 'technology', 'world'];
	}

	get lastPage() {
		return 2000;
	}

	get url() {
		return 'http://g1.globo.com';
	}

	_categoryUrl(category) {

		switch(category) {

			case 'economy': 		return `${this.url}/economia`;
			case 'health&science': 	return `${this.url}/ciencia-e-saude`;
			case 'politics': 		return `${this.url}/politica`;
			case 'technology': 		return `${this.url}/tecnologia`;
			case 'world': 			return `${this.url}/mundo`;
			default: 				return null;

		}

	}

	_parseLinks($) {

		// Get all components with news links
		const linkComponents = $('a[class=feed-post-link]');

		// Parses all links
		let links = new Set();
		$(linkComponents).each( (i, linkComponent) => {
			links.add( $(linkComponent).attr('href') );
		});

		return links;

	}

	_parseNews($) {

		let parsedNews = {};

		/* Scrapping content */
		let headline = $('.content-head__title').attr('itemprop', 'headline');
		headline = $(headline).text();

		if(headline) {
			parsedNews['headline'] = headline;
		} else {
			throw new TypeError('headline not found');
		}

		let datePublished = $('time').attr('itemprop', 'datePublished');
		datePublished = new Date( $(datePublished).attr('datetime') ).getTime();

		if(datePublished) {
			parsedNews['datePublished'] = datePublished;
		} else {
			throw new TypeError('date of publication not found');
		}

		const content = $('.content-text__container').text();
		
		if(content) {
			parsedNews['content'] = content;
		} else {
			throw new TypeError('content not found');
		}

		return parsedNews;

	}

}

module.exports = G1NewsCrawler;
