require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const fs = require("fs");
const path = require("path");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true})) 

app.use('/public', express.static(`${process.cwd()}/public`));

// DB file
const urlsFile = path.join(__dirname, "/url.json");

// unique id generator
const id = () => Math.random().toString(36).substring(2);

// get DB file
const getFileAsJson = (file) => {
  return JSON.parse(fs.readFileSync(file));
};

// save into DB file
const saveJsonFile = (file, urls) => {
  fs.writeFileSync(file, JSON.stringify({ urls }));
};

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'Hello API' });
});

// url shortner endpoint
app.post('/api/shorturl', (req, res) => {
  const url = req.body.url
  let urlArr = url.split('//')
 
  if (urlArr.length < 2) {
    return res.json({ error: 'invalid url' })
  } 
  else {
    let urls = getFileAsJson(urlsFile).urls
  
    for (let url of urls){
      if (url.url === urlArr[1]) {
        return res.json({original_url: `https://${url.url}`, short_url: url.hash})
      }
    }

    const hash = id()

    urls.push({url: urlArr[1], hash: hash})
    saveJsonFile(urlsFile, urls)

    return res.json({original_url: `https://${urlArr[1]}`, short_url: hash})
  }
})

// redirects to the url of short_url
app.get('/api/shorturl/:short_url', (req, res) => {
  let urls = getFileAsJson(urlsFile).urls
  const short_url = req.params.short_url

  for (let url of urls){
    if (url.hash === short_url) {
      return res.redirect(`https://${url.url}`)
    }
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
