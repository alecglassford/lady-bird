#!/usr/bin/env node

/* eslint no-console: 0 */

const bent = require('bent');
const cheerio = require('cheerio');
const fs = require('fs-extra');

const BASE_URL = 'https://www.rottentomatoes.com/m/lady_bird/reviews/?page=';
const NUM_PAGES = 11;
const DATA_PATH = 'reviews.json';

const get = bent('string', BASE_URL);
const result = [];

const getPage = async function getPageFunc(page) {
  const html = await get(page);
  console.log('⬇️ downloaded page', page);
  const $ = cheerio.load(html);
  $('.review_table_row').each((i, elem) => {
    const datum = {
      author: $(elem).find('.articleLink').text(),
      publication: $(elem).find('em').text(),
      fresh: $(elem).find('.review_icon').hasClass('fresh'),
      date: $(elem).find('.review_date').text(),
      summary: $(elem).find('.the_review').text(),
      url: $(elem).find('.review_desc a').attr('href'),
      score: $(elem).find('.review_desc .small.subtle').text().split('Original Score: ')[1],
    };
    result.push(datum);
  });
  console.log('✨ stored rows from page', page);
};

const getPages = async function downloadFunc() {
  const pageGetters = [];
  for (let page = 1; page <= NUM_PAGES; page += 1) {
    pageGetters.push(getPage(page));
  }
  await Promise.all(pageGetters);
  console.log('🐯 got all the pages');
  fs.outputJsonSync(DATA_PATH, result);
  console.log('⚡️ wrote data to disk');
};

getPages();
