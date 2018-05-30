'use strict';

/* REQUIRES */
const fs = require('fs');								// File System: The fs module provides an API for interacting with the file system in a manner closely modeled around standard POSIX functions.
const NewsCrawler = require('./news-crawler');			// NewsCrawler: Crawler made for news extraction and natural language analysis from different sources.
const CommandLineArgs = require('command-line-args');	// CommandLineArgs: A mature, feature-complete library to parse command-line options.
const CommandLineUsage = require('command-line-usage');	// CommandLineUsage: A simple, data-driven module for creating a usage guide.

// Loading environment variables
require('dotenv').config();

// Sets options for command line arguments and parses then
const optionDefinitions = [

	{ name: 'help', alias: 'h', type: Boolean, description: 'Display this usage guide', group: 'main' },

	{ name: 'source', alias: 's', type: String, defaultValue: 'g1', description: 'The source used to fetch the news', group: 'content' },
	{ name: 'category', alias: 'c', type: String, defaultValue: 'economy', description: 'The category to be fetched', group: 'content' },
	
	{ name: 'directory', alias: 'd', type: String, defaultValue: '.', description: 'Directory for saving the fetched data', group: 'file' },
	
	{ name: 'from-page', type: Number, defaultValue: 1, description: 'Starting page', group: 'pages' },
	{ name: 'number-pages', type: Number, defaultValue: 10, description: 'Number of pages to fetch', group: 'pages' }

];

const sections = [

	{ header: 'NewsCrawler', content: 'Crawler made for news extraction and natural language analysis from different sources.' },
	{ header: 'Main', optionList: optionDefinitions, group: 'main' },
	{ header: 'Content Options', optionList: optionDefinitions, group: 'content' },
	{ header: 'File Options', optionList: optionDefinitions, group: 'file' },
	{ header: 'Pages Options', optionList: optionDefinitions, group: 'pages' },

];
const usage = CommandLineUsage(sections);
const options = CommandLineArgs(optionDefinitions);

// Help requested
if(options._all.help) {
	console.log(usage);
	process.exit();
}

// Parsed data
const source = options._all.source;
const category = options._all.category;
const directory = options._all.directory;
const fromPage = options._all['from-page'];
const numberPages = options._all['number-pages'];

// Starts crawler
const crawler = new NewsCrawler();

// For all pages requested
async function run() { // jshint ignore:line

	for(let page = fromPage; page < fromPage + numberPages; page++) {
		const news = await crawler.fetchNews(source, category, page, 1); // jshint ignore:line
		let newsString = JSON.stringify( Array.from(news) );
		fs.writeFileSync(`${directory}/page_${page}.json`, newsString, 'utf8');
	}

}

run()
	.then( args => process.exit() )
	.catch( error => console.log(error) );
