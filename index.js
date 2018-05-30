'use strict';

/* REQUIRES */
const NewsCrawler = require('./news-crawler');

// Loading environment variables
require('dotenv').config();

const crawler = new NewsCrawler();
crawler.fetchNews('g1', 'economy', 1, 1).then( news => { console.log(news); } );


// /**************
//  * LIBRARIES
//  **************/
// const Args = require("args-parser")(process.argv)			 // Straight-forward node.js arguments parser
// const NewsCrawler = require("./src/main/news-crawler")

// /**************
//  * FUNCTIONS
//  **************/
// const argsHandler = () => {

// 	// HELP
// 	if(Args["h"] || Args["help"]) {

// 		console.log(
// 			"Usage: news-crawler [options]\n\n" +
// 			"Options:\n" +
// 			"  -h, --help 		prints module help\n" +
// 			"  -c, --category 	the category to be searched for\n" +
// 			"  --from-page		search starts from the selected page\n" +
// 			"  --number-pages	searches for the chosen number of pages"
// 		)
// 		process.exit();

// 	}

// 	// CATEGORY
// 	if(!Args["c"] && !Args["category"]) {
// 		Args["category"] = "world"
// 	} else if(!Args["category"]) {
// 		Args["category"] = Args["c"]
// 	}

// 	// FROM PAGE
// 	if(!Args["from-page"]) {
// 		Args["from-page"] = 1
// 	}

// 	// NUMBER PAGES
// 	if(!Args["number-pages"]) {
// 		Args["number-pages"] = 10
// 	}

// }

// /**************
//  * MAIN
//  **************/
// argsHandler();

// NewsCrawler.fetchNews(Args["category"], Args["from-page"], Args["number-pages"])
// 	.then(response => process.exit())
// 	.catch(error => {
// 		console.log(error)
// 		process.exit()
// 	})
