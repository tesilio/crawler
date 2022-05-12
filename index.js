const axios = require('axios');
const cheerio = require('cheerio');
const querystring = require('querystring');


async function getGoogleSearchResult(q) {
  const params = querystring.stringify({
    q,
    oq: q,
    ie: 'UTF-8',
  });
  const url = `https://www.google.com/search?${params}`;
  const html = await axios.get(url);
  html.data = html.data.replace(/�/gi, '');
  console.log(html.data);
  const $ = cheerio.load(html.data);
  const divs = $('#main > div');
  const contentArray = [];

  const firstDiv = $('#main > div:nth-child(4)');
  let title = $(firstDiv).find('div > div:nth-child(1) span:nth-child(3) span').text();

  let content = '';


  if (title.includes('번역')) {
    title = $(firstDiv).find('div > div:nth-child(1) span:nth-child(3) span').text();
    content = $(firstDiv).find('div > div:nth-child(3) > div > div > div > div > div:nth-child(1) > div > div > div > div').text();
  }

  if (title.includes('날씨')) {
    title = $(firstDiv).find('div > div:nth-child(1) > span:nth-child(1) > span').text();
    const degrees = $(firstDiv).find('div > div:nth-child(3) > div > div > div > div > div:nth-child(1) > div:nth-child(1) > div > div > div > div').text();
    const description = $(firstDiv).find('div > div:nth-child(3) > div > div > div > div > div:nth-child(1) > div:nth-child(2) > div > div > div > div').text();
    content = `${degrees.replace(/C/, '℃')}\n${description}`;
  }
  if (content === '') {
    title = '일반 검색 결과';
    $(divs).each((idx, div) => {
      if (idx >= 3 && idx <= 11) {
        const title = $(div).find('div > div:nth-child(1) > a > div:nth-child(1)').text();
        const href = $(div).find('div > div:nth-child(1) > a').attr('href');
        let url = href ? href.replace(/^(\/url\?q=)/gi, '') : href;
        url = url ? url.replace(/^(\/imgres\?imgurl=)/gi, '') : url;
        url = querystring.parse(url);
        url = Object.keys(url).length > 0 ? Object.keys(url)[0] : '';
        // const navigator = $(div).find('div > div:nth-child(1) > a > div:nth-child(2)').text();
        // const description = $(div).find('div > div:nth-child(3)').text();
        if (title && url) {
          contentArray.push(`- [🔗](${url}) ${title}`);
        }
        // console.log('title:', title);
        // console.log('url:', url);
        // console.log('navigator:', navigator);
        // console.log('description:', description);
      }
    });
    content = contentArray.join('\n');
  }
  if (content === '') {
    content = '없음';
  }
  console.log(title, content);
  return { q, title, content };
}

getGoogleSearchResult('문재인');