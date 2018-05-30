'use strict';

/* REQUIRES */
const { CrawlerFactory } = require('./crawlers');					// CrawlerFactory: Generates crawlers with transparency.
const { createLogger, format, transports } = require('winston');	// Winston: A logger for just about everything.
const { combine, timestamp, label, printf } = format;

/* CLASS */
class NewsCrawler {

	constructor() {

		// Creates a custom format for the logger
		const customFormat = printf( info => {
			return `${info.timestamp} [${info.label}] [${info.level}]: ${info.message}`;
		});

		this._logger = createLogger({
			format: combine(
				label({ label: 'NewsCrawler' }),
				timestamp(),
				customFormat
			),
			transports: [
				new transports.Console()
			]
		});

	}

	async fetchNews(source, category, fromPage = 1, numberPages = 10) { // jshint ignore:line
		
		/* Verifying variables */
		if(Array.isArray(source)) {

			for(let s of source) {
				if(!this.sourceAvailable(s)) {
					throw TypeError( `source ${source} not available` );
				}
			}

		} else {

			if(!this.sourceAvailable(source)) {
				throw TypeError( `source ${source} not available` );
			}

			source = [source];

		}

		if(fromPage <= 0) {
			throw RangeError( `fromPage needs to be higher than zero` );
		}

		// Starting crawler
		this._logger.info( `Starting ...` );
		const started = Date.now();

		// Fetching sources
		let news = new Set();
		for(let s of source) {

			this._logger.info( `Fetching from '${s}' ...` );
			const crawler = CrawlerFactory.createCrawler(s);
			try {

				const fetchedNews = await crawler.fetchNews(category, fromPage, numberPages); // jshint ignore:line
				for(let n of fetchedNews) {
					news.add(n);
				}

			} catch(error) {
				this._logger.error( `Source '${s}'' couldn't be fetched (${error})` );
			}

		}

		// Ending crawler
		const ended = Date.now();
		this._logger.info( `The crawler has taken ${(ended - started) / 1000}s for total fetching` );
		this._logger.info( `${news.size} news have been fetched on total` );

		return news;

	}

	sourceAvailable(source) {
		return this.sources.indexOf(source) > -1;
	}

	get sources() {
		return ['g1'];
	}

}

module.exports = NewsCrawler;
