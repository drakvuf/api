const { Site, Article, Day, Weather, Rate, Category } = require("db");
const { search, createSearchClient } = require("search");
const { createLogMessage } = require("logger");

const client = createSearchClient(process.env.HOST, process.env.LOG);

function stringListToArray(items, separator = ",") {
  return items ? items.split(separator) : [];
}

async function init(request, response, next) {
  console.log("init");
  try {
    const [sites, categories, day, weather, rates] = await Promise.all([
      Site.lists(),
      Category.lists(),
      Day.today(),
      Weather.getBy({ city: "Budapest" }),
      Rate.lists(1),
    ]);

    response.json({
      day,
      weather,
      rates,
      categories,
      sites,
    });
  } catch (error) {
    console.log(error);
    next(
      new Error(
        createLogMessage({
          page: "api/init",
          error: error.message,
        })
      )
    );
  }
}

async function index(request, response, next) {
  try {
    const siteIds = stringListToArray(request.query.sites);
    const categoryIds = stringListToArray(request.query.categories);
    const until = request.query.until || new Date();

    const { count, rows } = await Article.lists(
      siteIds,
      categoryIds,
      until,
      20
    );

    response.json({
      count,
      articles: rows,
    });
  } catch (error) {
    next(
      new Error(
        createLogMessage({
          page: "api/index",
          error: error.message,
        })
      )
    );
  }
}

async function searchArticles(request, response, next) {
  try {
    const query = request.query.query || "";
    const siteIds = stringListToArray(request.query.sites);
    const categoryIds = stringListToArray(request.query.categories);
    const from = request.query.from;
    const until = request.query.until;
    const skip = request.query.skip;
    const sort = request.query.sort;

    const { articles, total } = await search(
      client,
      query,
      siteIds,
      categoryIds,
      from,
      until,
      skip,
      sort
    );

    const formattedArticles = articles.map(function (article) {
      return {
        ...article,
        Site: article.site,
      };
    });

    const totalValue = total && total.value ? total.value : 0;

    response.json({ articles: formattedArticles, total: totalValue });
  } catch (error) {
    next(
      new Error(
        createLogMessage({
          resource: "search",
          error: error.message,
        })
      )
    );
  }
}

module.exports = {
  init,
  index,
  search: searchArticles,
};
