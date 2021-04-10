var CKAN = require('ckan');

let client = new CKAN.Client("https://data.gov.ro/api");

client.action("package_show", {id: "b86a78a3-7f88-4b53-a94f-015082592466"}, function(err, response) {

	if (err) {
		console.log("Error " + err);
		return;
	}

	var resources = response.result.resources;
	resources
		.filter(resource => resource.url.indexOf("transparenta") != -1)
		.forEach(resource => download(resource.name, resource.url));
});

const https = require('https');
const fs = require('fs');
const path = require('path');

function download(fileName, URL) {
	let filepath = path.join(process.cwd() + "/downloads", fileName);
	fs.writeFileSync(filepath,"");
	const file = fs.createWriteStream(filepath);
	https.get(URL, function(response){
		response.pipe(file);
	})
}
