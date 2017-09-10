var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();
var _ 		= require("lodash")
var async 	= require('async');

app.get('/scrape', function(req, res){

    var options = {
	    url: "http://rodong.rep.kp/en/index.php?strPageID=SF01_01_02&iMenuID=1&iSubMenuID=1",
		headers: {
		'User-Agent': 'request'
		}
	};

	var articles = []
	var articlesURL = []

    request(options, function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

			var page = 1,
			    lastPage = 9;
			async.whilst(function () {
				return page <= lastPage;
			},
			function (next) {
        	    var options = {
				    url: "http://rodong.rep.kp/en/index.php?strPageID=SF01_01_02&iMenuID=1&iSubMenuID="+page,
					headers: {
					'User-Agent': 'request'
					}
				};
				console.log("Requesting http://rodong.rep.kp/en/index.php?strPageID=SF01_01_02&iMenuID=1&iSubMenuID="+page)
				request(options, function (error, response, html) {
					if (!error) {
            			var mec = cheerio.load(html);

			            mec('.ListNewsLineContainer').each(function(index, NewsLine){
			                var data = $(NewsLine);
			                newsUrl = new RegExp(/\('(.*)'\)/).exec(data.children().find(".ListNewsLineTitle a").attr("href"))[1]

							articlesURL.unshift(newsUrl)
			            })
					}
					page++;
					next();
				});
			},
			function (err) {
				console.log("===== SCRAPPING ARTICLES =====")
				var id = 0,
				    lastId = articlesURL.length-1;
				async.whilst(function () {
					return id <= lastId;
				},
				function (nextnext) {
	        	    var options = {
					    url: "http://rodong.rep.kp/en/"+articlesURL[id],
						headers: {
						'User-Agent': 'request'
						}
					};
					console.log("http://rodong.rep.kp/en/"+articlesURL[id])
					request(options, function (error, response, html) {
						if (!error && response.statusCode == 200) {
							var ceSoir = cheerio.load(html)

							title = ceSoir("body > center > table > tbody > tr > td > p:nth-child(1) > font").text()
							var body = "";

							ceSoir('.ArticleContent').each(function(index, value){
            					body = body + ceSoir(value).text() + "\n";
							})

							articles.push({
								title: title,
								body: body
							})
						}
						id++;
						nextnext();
					});
				},
				function (err) {
					console.log(articles)
					fs.writeFile("./articles.txt", JSON.stringify(articles), function(err) {
					    if(err) {
					        return console.log(err);
					    }
					    console.log("The file was saved!");
					}); 
					fs.writeFile("./lastArticleId.txt", articlesURL[articlesURL.length - 1], function(err) {
					    if(err) {
					        return console.log(err);
					    }
					    console.log("The file was saved!");
					}); 
				});
			});
        }
    })
})

app.listen('8000')
console.log('Magic happens on port 8000');
exports = module.exports = app;



				/*
				
        	    var options = {
				    url: "http://rodong.rep.kp/en/"+newsUrl,
					headers: {
					'User-Agent': 'request'
					}
				};
				
				request(options, function (error, response, body) {
					if (!error && response.statusCode == 200) {
						var ceSoir = cheerio.load(html)

						title = ceSoir("body > center > table > tbody > tr > td > p:nth-child(1) > font").text()
						console.log(title)
					}
				});
				*/



                /*
	                var news = {};
	                news.id = new RegExp(/\d{4}-\d{2}-\d{2}-\d{4}/).exec(data.children().find(".ListNewsLineTitle a").attr("href"))[0]
	                news.title = data.children().find(".ListNewsLineTitle a").text().split("[  ]")[0]
                */



			                /*

                var promises = articlesURL.map(function(url) {
                    return new Promise(function(resolve, reject) {
		        	    var options = {
						    url: "http://rodong.rep.kp/en/"+url,
							headers: {
							'User-Agent': 'request'
							}
						};
						console.log(url)
						request(options, function (error, response, body) {
							if (!error && response.statusCode == 200) {
								var ceSoir = cheerio.load(html)

								title = ceSoir("body > center > table > tbody > tr > td > p:nth-child(1) > font").text()
								resolve({
									title: title,
									body: "MEC ON BOIT"
								})
							}
						});
                    });
                });

                Promise.all(promises).then(function(articles) {
                	console.log(articles)
                });
                */