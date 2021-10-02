const db = require("../db/connection.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    it("200: returns an object describing all available endpoints on my API", async () => {
      const { body } = await request(app).get("/api").expect(200);

      expect(body.endpoints).toBeInstanceOf(Object);
      expect(body.endpoints).toMatchObject({
        "GET /api": expect.any(Object),
        "GET /api/topics": expect.any(Object),
        "GET /api/articles": expect.any(Object),
      });
    });
  });
  describe("/api/path-non-existent", () => {
    it("404: returns a custom 'not found' error message", async () => {
      const { body } = await request(app)
        .get("/api/path-non-existent")
        .expect(404);

      expect(body.msg).toBe("Sorry, that is not found");
    });
  });
  describe("/api/topics", () => {
    describe("GET", () => {
      it("200: returns an object with an array of topic objects on a key of topics", async () => {
        const { body } = await request(app).get("/api/topics").expect(200);

        expect(body.topics).toBeInstanceOf(Array);
        expect(body.topics.length).toBeGreaterThan(0);
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.stringMatching(/^(mitch|cats|paper)$/),
          });
        });
      });
    });
    describe("POST", () => {
      it("201: takes a slug and description, inserts into the topics table and returns the new topic", async () => {
        const { body } = await request(app)
          .post("/api/topics")
          .send({
            slug: "tech",
            description: "all things technological!",
          })
          .expect(201);

        expect(body.topic).toEqual({
          slug: "tech",
          description: "all things technological!",
        });
      });
      it("201: ignores unecessary extra keys", async () => {
        const { body } = await request(app)
          .post("/api/topics")
          .send({
            slug: "tech",
            description: "all things technological!",
            extras: "ignore this please",
          })
          .expect(201);

        expect(body.topic).toEqual({
          slug: "tech",
          description: "all things technological!",
        });
      });
      it("409: returns 'Sorry, that already exists' if attempting to post a topic which already exists and does not change the existing topic", async () => {
        const { body } = await request(app)
          .post("/api/topics")
          .send({
            slug: "paper",
            description: "flat trees",
          })
          .expect(409);

        expect(body.msg).toBe("Sorry, that already exists");

        const { rows } = await db.query(
          `SELECT * FROM topics WHERE slug = 'paper';`
        );
        expect(rows[0]).toEqual({
          slug: "paper",
          description: "what books are made of",
        });
      });
      it("400: responds with 'Bad Request' when attempting to post with any key missing", async () => {
        const { body: missingSlug } = await request(app)
          .post("/api/topics")
          .send({
            description: "a way to remember you've forgotten something",
          })
          .expect(400);

        expect(missingSlug.msg).toBe("Bad Request");

        const { body: missingDescription } = await request(app)
          .post("/api/topics")
          .send({
            slug: "remembrall",
          })
          .expect(400);

        expect(missingDescription.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with any key value missing", async () => {
        const { body: missingSlug } = await request(app)
          .post("/api/topics")
          .send({
            slug: "dark energy",
            desciption: null,
          })
          .expect(400);

        expect(missingSlug.msg).toBe("Bad Request");

        const { body: missingDescription } = await request(app)
          .post("/api/topics")
          .send({
            slug: null,
            description: "Absolute zero",
          })
          .expect(400);

        expect(missingDescription.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with the wrong data type in slug", async () => {
        const { body } = await request(app)
          .post("/api/topics")
          .send({
            slug: 859026244647,
            description: "my favourite number",
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with the wrong data type in description", async () => {
        const { body } = await request(app)
          .post("/api/topics")
          .send({
            slug: "arrays",
            description: ["they just keep things so orderly"],
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with too many characters in slug", async () => {
        const { body } = await request(app)
          .post("/api/topics")
          .send({
            slug: "o".repeat(101),
            description: "things that make you go 'ooo'",
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with too many characters in slug", async () => {
        const { body } = await request(app)
          .post("/api/topics")
          .send({
            slug: "stress",
            description: "a".repeat(301),
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
    });
  });
  describe("/api/articles", () => {
    describe("GET", () => {
      it("200: responds with an object containing an array of all article objects", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            body: expect.any(String),
            votes: expect.any(Number),
            topic: expect.stringMatching(/^(mitch|cats|paper)$/),
            author: expect.stringMatching(
              /^(butter_bridge|icellusedkars|rogersop|lurker)$/
            ),
            comment_count: expect.any(String),
          });
        });
      });
      it("200: sorts by defaults of date descending when no sort or order query is used", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
      it("200: sorts by custom column & default order descending when valid column name is used in sort_by query", async () => {
        const { body } = await request(app)
          .get("/api/articles?sort_by=title")
          .expect(200);

        expect(body.articles).toBeSortedBy("title", { descending: true });
      });
      it("200: can optionally change sort by order to ascending when ?order=ASC query is passed in", async () => {
        const { body } = await request(app)
          .get("/api/articles?order=ASC")
          .expect(200);

        expect(body.articles).toBeSortedBy("created_at");
      });
      it("200: can use order ascending with custom sort_by query", async () => {
        const { body } = await request(app)
          .get("/api/articles?sort_by=title&order=ASC")
          .expect(200);

        expect(body.articles).toBeSortedBy("title");
      });
      it("200: can optionally filter by topic with valid topic name passed in as a query", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=cats")
          .expect(200);

        expect(body.articles.length).toBeGreaterThan(0);
        body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
      });
      it("200: responds with empty array when filter by valid topic with zero articles", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=paper")
          .expect(200);

        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBe(0);
      });
      it("200: can optionally filter by author with valid author username passed in as a query", async () => {
        const { body } = await request(app)
          .get("/api/articles?author=rogersop")
          .expect(200);

        expect(body.articles.length).toBe(3);
        body.articles.forEach((article) => {
          expect(article.author).toBe("rogersop");
        });
      });
      it("200: responds with empty array when filter by valid author with zero articles", async () => {
        const { body } = await request(app)
          .get("/api/articles?author=lurker")
          .expect(200);

        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBe(0);
      });
      it("200: responds with empty array when filter by valid author with zero articles in valid topic", async () => {
        const { body } = await request(app)
          .get("/api/articles?author=rogersop&topic=paper")
          .expect(200);

        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBe(0);
      });
      it("200: can filter by valid author and valid topic", async () => {
        const { body } = await request(app)
          .get("/api/articles?author=rogersop&topic=mitch")
          .expect(200);

        expect(body.articles).toBeInstanceOf(Array);
        expect(body.articles.length).toBe(2);
      });
      it("400: responds with bad request when invalid column name is used in sort_by query", async () => {
        const { body } = await request(app)
          .get("/api/articles?sort_by=not_a_column")
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with bad request when anything other than ASC or DESC is used in order query", async () => {
        const { body } = await request(app)
          .get("/api/articles?order=some_other_value")
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("404: responds with 'Sorry, that is not found' when an invalid topic is used in topic filter query", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=not_a_topic")
          .expect(404);

        expect(body.msg).toBe("Sorry, that is not found");
      });
      it("404: responds with 'Sorry, that is not found' when an invalid author username is used in author filter query", async () => {
        const { body } = await request(app)
          .get("/api/articles?author=not_a_username")
          .expect(404);

        expect(body.msg).toBe("Sorry, that is not found");
      });
      it("404: responds with 'Sorry, that is not found' when an invalid author username query is passed in alongside valid topic query", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=mitch&author=not_a_username")
          .expect(404);

        expect(body.msg).toBe("Sorry, that is not found");
      });
      it("200: response default is to return with first 10 articles when no limit or page queries are passed in", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        expect(body.articles).toHaveLength(10);
        expect(body.articles[0].article_id).toBe(3);
      });
      it("200: response returns specified number of articles when limit query is passed in without a page query", async () => {
        const { body: smallerPage } = await request(app)
          .get("/api/articles?limit=6")
          .expect(200);
        const { body: largerPage } = await request(app)
          .get("/api/articles?limit=11")
          .expect(200);

        expect(smallerPage.articles).toHaveLength(6);
        expect(largerPage.articles).toHaveLength(11);
      });
      it("200: returns articles starting from correct multiple of limit when specified by an optional page query", async () => {
        const { body: firstPage } = await request(app)
          .get("/api/articles?page=1")
          .expect(200);

        const { body: secondPage } = await request(app)
          .get("/api/articles?page=2")
          .expect(200);

        expect(firstPage.articles).toHaveLength(10);

        expect(secondPage.articles).toHaveLength(2);
        expect(secondPage.articles[0].article_id).toBe(11);
        expect(secondPage.articles[1].article_id).toBe(7);
      });
      it("200: response returns correct number of articles when page query is passed in along with limit and other queries", async () => {
        const { body: smallerPage } = await request(app)
          .get("/api/articles?limit=3&page=3")
          .expect(200);
        const { body: largerPage } = await request(app)
          .get("/api/articles?limit=11&page=2")
          .expect(200);

        expect(smallerPage.articles).toHaveLength(3);
        expect(largerPage.articles).toHaveLength(1);

        const { body: heavilyQueriedPage } = await request(app)
          .get(
            "/api/articles?limit=4&page=2&order=ASC&sort_by=article_id&topic=mitch"
          )
          .expect(200);

        expect(heavilyQueriedPage.articles[0].article_id).toBe(6);
        expect(heavilyQueriedPage.articles[1].article_id).toBe(7);
        expect(heavilyQueriedPage.articles[2].article_id).toBe(8);
        expect(heavilyQueriedPage.articles[3].article_id).toBe(9);
      });
      it("200: response object has a property total_count which is the total number of articles (ignoring limit)", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        expect(body.total_count).toBe("12");
      });
      it("200: total_count property takes any filters into account", async () => {
        const { body: catsBody } = await request(app)
          .get("/api/articles?topic=cats")
          .expect(200);

        expect(catsBody.total_count).toBe("1");

        const { body: paperBody } = await request(app)
          .get("/api/articles?topic=paper")
          .expect(200);

        expect(paperBody.total_count).toBe("0");
      });
      it("400: responds with bad request when value passed in as limit is not a number", async () => {
        const { body } = await request(app)
          .get("/api/articles?limit=not_a_num")
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with bad request when value passed in as limit is a negative number", async () => {
        const { body } = await request(app)
          .get("/api/articles?limit=-4")
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with bad request when 0 is passed in as limit", async () => {
        const { body } = await request(app)
          .get("/api/articles?limit=0")
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with bad request when value passed in as page is not a number", async () => {
        const { body } = await request(app)
          .get("/api/articles?page=no_number_here")
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with bad request when value passed in as page is 0 or less", async () => {
        const { body: pageMinusOne } = await request(app)
          .get("/api/articles?page=-1")
          .expect(400);

        expect(pageMinusOne.msg).toBe("Bad Request");

        const { body: pageZero } = await request(app)
          .get("/api/articles?page=0")
          .expect(400);

        expect(pageZero.msg).toBe("Bad Request");
      });
      it("404: responds with 'Sorry, that is not found' when value passed in as page is larger than last page containing articles (dependant on limit value)", async () => {
        const { body: limit10Result } = await request(app)
          .get("/api/articles?page=3")
          .expect(404);

        expect(limit10Result.msg).toBe("Sorry, that is not found");

        const { body: limit15Result } = await request(app)
          .get("/api/articles?limit=15&page=2")
          .expect(404);

        expect(limit15Result.msg).toBe("Sorry, that is not found");
      });
    });
    describe("POST", () => {
      it("201: takes an object with an author, title, body and topic, inserts into article table and returns the new article", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop",
            title: "This is a test article",
            body: "We live in a society",
            topic: "cats",
          })
          .expect(201);

        expect(body.article).toEqual({
          author: "rogersop",
          title: "This is a test article",
          body: "We live in a society",
          topic: "cats",
          article_id: 13,
          votes: 0,
          created_at: expect.any(String),
          comment_count: "0",
        });
      });
      it("201: ignores unecessary extra keys in request", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop",
            title: "This is a test article",
            body: "We live in a society",
            topic: "cats",
            spooky: "Courage The Cowardly Dog",
          })
          .expect(201);

        expect(body.article).toEqual({
          author: "rogersop",
          title: "This is a test article",
          body: "We live in a society",
          topic: "cats",
          article_id: 13,
          votes: 0,
          created_at: expect.any(String),
          comment_count: "0",
        });
      });
      it("404: responds with 'Sorry, that is not found' when attempting to post with an author which does not exist in the users table", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: "whoami?",
            title: "This is a test article",
            body: "We live in a society",
            topic: "cats",
            spooky: "Courage The Cowardly Dog",
          })
          .expect(404);

        expect(body.msg).toBe("Sorry, that is not found");
      });
      it("404: responds with 'Sorry, that is not found' when attempting to post with a topic which does not exist in the topics table", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: "This is a test article",
            body: "We live in a society",
            topic: "books",
            spooky: "Courage The Cowardly Dog",
          })
          .expect(404);

        expect(body.msg).toBe("Sorry, that is not found");
      });
      it("400: responds with 'Bad Request' when attempting to post with any key missing", async () => {
        const { body: missingAuthor } = await request(app)
          .post("/api/articles")
          .send({
            title: "This is a test article",
            body: "We live in a society",
            topic: "books",
          })
          .expect(400);

        expect(missingAuthor.msg).toBe("Bad Request");

        const { body: missingTitle } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            body: "We live in a society",
            topic: "books",
          })
          .expect(400);

        expect(missingTitle.msg).toBe("Bad Request");

        const { body: missingBody } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: "This is a test article",
            topic: "books",
          })
          .expect(400);

        expect(missingBody.msg).toBe("Bad Request");

        const { body: missingTopic } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: "This is a test article",
            body: "We live in a society",
          })
          .expect(400);

        expect(missingTopic.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with any key value missing", async () => {
        const { body: missingAuthor } = await request(app)
          .post("/api/articles")
          .send({
            author: null,
            title: "This is a test article",
            body: "We live in a society",
            topic: "books",
          })
          .expect(400);

        expect(missingAuthor.msg).toBe("Bad Request");

        const { body: missingTitle } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: null,
            body: "We live in a society",
            topic: "books",
          })
          .expect(400);

        expect(missingTitle.msg).toBe("Bad Request");

        const { body: missingBody } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: "This is a test article",
            body: null,
            topic: "books",
          })
          .expect(400);

        expect(missingBody.msg).toBe("Bad Request");

        const { body: missingTopic } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: "This is a test article",
            body: "We live in a society",
            topic: null,
          })
          .expect(400);

        expect(missingTopic.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with the wrong data type in author", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: false,
            title: "This is a test article",
            body: "We live in a society",
            topic: "books",
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with the wrong data type in title", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: 342,
            body: "We live in a society",
            topic: "books",
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with the wrong data type in body", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: "This is a test article",
            body: false,
            topic: "books",
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with the wrong data type in topic", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: "This is a test article",
            body: "We live in a society",
            topic: ["cats"],
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to post with too many characters in title", async () => {
        const { body } = await request(app)
          .post("/api/articles")
          .send({
            author: "rogersop?",
            title: "test".repeat(155),
            body: "I sure do love a good test",
            topic: "cats",
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
    });
    describe("/api/articles/:article_id", () => {
      describe("GET", () => {
        it("200: accepts an article ID and responds with that article in an object on a key of article", async () => {
          const { body } = await request(app)
            .get("/api/articles/5")
            .expect(200);

          expect(body.article).toMatchObject({
            title: "UNCOVERED: catspiracy to bring down democracy",
            topic: "cats",
            author: "rogersop",
            body: "Bastet walks amongst us, and the cats are taking arms!",
            created_at: "2020-08-03T13:14:00.000Z",
            votes: 0,
            comment_count: "2",
          });
        });
        it("404: returns a custom 'not found' error message for valid but non-existent article_id", async () => {
          const { body } = await request(app)
            .get("/api/articles/750")
            .expect(404);

          expect(body.msg).toBe("Sorry, that is not found");
        });
        it("400: returns with 'Bad Request' for invalid article_id", async () => {
          const { body } = await request(app)
            .get("/api/articles/not_an_article_id")
            .expect(400);

          expect(body.msg).toBe("Bad Request");
        });
      });
      describe("PATCH", () => {
        it("200: increments vote count in specified article by amount provided in request body where original votes are 0, and responds with the updated article", async () => {
          const { body } = await request(app)
            .patch("/api/articles/3")
            .send({ inc_votes: 4 })
            .expect(200);

          const { rows } = await db.query(
            `SELECT votes FROM articles WHERE article_id = 3`
          );
          expect(rows[0].votes).toBe(4);
          expect(body.article).toMatchObject({
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            author: "icellusedkars",
            body: "some gifs",
            votes: 4,
          });
        });
        it("200: increments vote count where original votes were more than 0", async () => {
          const { body } = await request(app)
            .patch("/api/articles/1")
            .send({ inc_votes: 30 })
            .expect(200);

          const { rows } = await db.query(
            `SELECT votes FROM articles WHERE article_id = 1`
          );
          expect(rows[0].votes).toBe(130);
          expect(body.article.votes).toBe(130);
        });
        it("200: does not increment vote count on any other article", async () => {
          const { body } = await request(app)
            .patch("/api/articles/3")
            .send({ inc_votes: 45 })
            .expect(200);

          const { rows } = await db.query(
            `SELECT votes FROM articles WHERE article_id = 2`
          );
          expect(rows[0].votes).toBe(0);
        });
        it("404: returns a custom 'not found' error message for valid but non-existent article_id", async () => {
          const { body } = await request(app)
            .patch("/api/articles/840")
            .send({ inc_votes: 70 })
            .expect(404);

          expect(body.msg).toBe("Sorry, that is not found");
        });
        it("400: returns with 'Bad Request' for invalid article_id", async () => {
          const { body } = await request(app)
            .patch("/api/articles/string_NaN")
            .send({ inc_votes: 70 })
            .expect(400);

          expect(body.msg).toBe("Bad Request");
        });
        it("400: returns with 'Bad Request' when sending anything other than number on the inc_votes key and does not update the article's votes", async () => {
          const { body } = await request(app)
            .patch("/api/articles/3")
            .send({ inc_votes: "not a number" })
            .expect(400);

          expect(body.msg).toBe("Bad Request");

          const { rows } = await db.query(
            `SELECT votes FROM articles WHERE article_id = 3`
          );
          expect(rows[0].votes).toBe(0);
        });
        it("400: responds with 'Bad Request' when attempting to PATCH with null inc_votes", async () => {
          const { body } = await request(app)
            .patch("/api/articles/3")
            .send({
              inc_votes: null,
            })
            .expect(400);

          expect(body.msg).toBe("Bad Request");
        });
        it("400: responds with 'Bad Request' when attempting to PATCH with NaN", async () => {
          const { body } = await request(app)
            .patch("/api/articles/3")
            .send({
              inc_votes: NaN,
            })
            .expect(400);

          expect(body.msg).toBe("Bad Request");
        });
        it("400: responds with 'Bad Request' when trying to send a patch request with inc_votes missing", async () => {
          const { body } = await request(app)
            .patch("/api/articles/3")
            .send({})
            .expect(400);

          expect(body.msg).toBe("Bad Request");
        });
        it("200: ignores unnecessary extra keys in request", async () => {
          const { body } = await request(app)
            .patch("/api/articles/3")
            .send({
              inc_votes: 98,
              spooky: "this should not be here",
            })
            .expect(200);

          expect(body.article).toMatchObject({
            article_id: 3,
            author: "icellusedkars",
            body: "some gifs",
            created_at: expect.any(String),
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            votes: 98,
          });
        });
        it("400: responds with 'Bad Request' if send incorrect key in request", async () => {
          const { body } = await request(app)
            .patch("/api/articles/3")
            .send({
              increase_the_votes_by: 4,
            })
            .expect(400);

          expect(body.msg).toBe("Bad Request");
        });
      });
      describe("/api/articles/:article_id/comments", () => {
        describe("GET", () => {
          it("200: respond with an array of comments for the given article_id", async () => {
            const { body } = await request(app)
              .get("/api/articles/9/comments")
              .expect(200);

            expect(body.comments).toBeInstanceOf(Array);
            expect(body.comments.length).toBeGreaterThan(0);
            body.comments.forEach((comment) => {
              expect(comment.hasOwnProperty("article_id")).toBe(false);
              expect(comment).toMatchObject({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                author: expect.stringMatching(
                  /^(butter_bridge|icellusedkars|rogersop|lurker)$/
                ),
                body: expect.any(String),
              });
            });
          });
          it("200: respond with 200 if no comments on specified article", async () => {
            const { body } = await request(app)
              .get("/api/articles/3/comments")
              .expect(200);

            expect(body.comments).toEqual([]);
          });
          it("404: returns a custom 'not found' error message for valid but non-existent article_id", async () => {
            const { body } = await request(app)
              .get("/api/articles/9000/comments")
              .expect(404);

            expect(body.msg).toBe("Sorry, that is not found");
          });
          it("400: returns with 'Bad Request' for invalid article_id", async () => {
            const { body } = await request(app)
              .get("/api/articles/string_NaN/comments")
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("200: response default is to return with first 10 comments when no limit or page queries are passed in", async () => {
            const { body } = await request(app)
              .get("/api/articles/1/comments")
              .expect(200);

            expect(body.comments).toHaveLength(10);
            expect(body.comments[0].comment_id).toBe(2);
          });
          it("200: response returns specified number of comments when limit query is passed in without a page query", async () => {
            const { body: smallerPage } = await request(app)
              .get("/api/articles/1/comments?limit=7")
              .expect(200);
            const { body: largerPage } = await request(app)
              .get("/api/articles/1/comments?limit=13")
              .expect(200);

            expect(smallerPage.comments).toHaveLength(7);
            expect(largerPage.comments).toHaveLength(13);
          });
          it("200: returns comments starting from correct multiple of limit when specified by an optional page query", async () => {
            const { body: firstPage } = await request(app)
              .get("/api/articles/1/comments?page=1")
              .expect(200);

            const { body: secondPage } = await request(app)
              .get("/api/articles/1/comments?page=2")
              .expect(200);

            expect(firstPage.comments).toHaveLength(10);

            expect(secondPage.comments).toHaveLength(3);
            expect(secondPage.comments[0].comment_id).toBe(12);
            expect(secondPage.comments[1].comment_id).toBe(13);
            expect(secondPage.comments[2].comment_id).toBe(18);
          });
          it("200: response returns correct number of comments when page query is passed in along with limit", async () => {
            const { body: smallerPage } = await request(app)
              .get("/api/articles/1/comments?limit=4&page=3")
              .expect(200);
            const { body: largerPage } = await request(app)
              .get("/api/articles/1/comments?limit=11&page=2")
              .expect(200);

            expect(smallerPage.comments).toHaveLength(4);
            expect(largerPage.comments).toHaveLength(2);
          });
          it("400: responds with bad request when value passed in as limit is not a number", async () => {
            const { body } = await request(app)
              .get("/api/articles/3/comments?limit=not_a_num")
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with bad request when value passed in as limit is a negative number", async () => {
            const { body } = await request(app)
              .get("/api/articles/2/comments?limit=-4")
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with bad request when 0 is passed in as limit", async () => {
            const { body } = await request(app)
              .get("/api/articles/2/comments?limit=0")
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with bad request when value passed in as page is not a number", async () => {
            const { body } = await request(app)
              .get("/api/articles/2/comments?page=no_number_here")
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with bad request when value passed in as page is 0 or less", async () => {
            const { body: pageMinusOne } = await request(app)
              .get("/api/articles/2/comments?page=-1")
              .expect(400);

            expect(pageMinusOne.msg).toBe("Bad Request");

            const { body: pageZero } = await request(app)
              .get("/api/articles/3/comments?page=0")
              .expect(400);

            expect(pageZero.msg).toBe("Bad Request");
          });
          it("404: responds with 'Sorry, that is not found' when value passed in as page is larger than last page containing articles (dependant on limit value)", async () => {
            const { body: limit10Result } = await request(app)
              .get("/api/articles/8/comments?page=2")
              .expect(404);

            expect(limit10Result.msg).toBe("Sorry, that is not found");

            const { body: limit15Result } = await request(app)
              .get("/api/articles/1/comments?limit=15&page=2")
              .expect(404);

            expect(limit15Result.msg).toBe("Sorry, that is not found");

            const { body: limit6Result } = await request(app)
              .get("/api/articles/1/comments?limit=6&page=4")
              .expect(404);

            expect(limit6Result.msg).toBe("Sorry, that is not found");
          });
        });
        describe("POST", () => {
          it("201: successfully posts the provided comment to the specified article_id, and returns the posted comment", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: "lurker",
                body: "Wrong sub... surely should be in /cats",
              })
              .expect(201);

            expect(body.comment).toEqual({
              comment_id: expect.any(Number),
              article_id: 9,
              author: "lurker",
              body: "Wrong sub... surely should be in /cats",
              votes: 0,
              created_at: expect.any(String),
            });
          });
          it("404: responds with 'Sorry, that is not found' when attempting to post a comment to an article that does not exist", async () => {
            const { body } = await request(app)
              .post("/api/articles/9000/comments")
              .send({
                username: "lurker",
                body: "Is there anybody in here..?",
              })
              .expect(404);

            expect(body.msg).toBe("Sorry, that is not found");
          });
          it("400: responds with 'Bad Request' for invalid article_id", async () => {
            const { body } = await request(app)
              .post("/api/articles/not_a_valid_Id/comments")
              .send({
                username: "lurker",
                body: "Am I lost..?",
              })
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("404: responds with 'Sorry, that is not found' when trying to post comment under a username which does not exist", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: "whoamI",
                body: "I could be anyone!",
              })
              .expect(404);

            expect(body.msg).toBe("Sorry, that is not found");
          });
          it("400: responds with 'Bad Request' when trying to post comment under a username which is not the correct data type", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: 542,
                body: "Something isn't right here...",
              })
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with 'Bad Request' when trying to post comment under a missing username", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: null,
                body: "Something isn't right here...",
              })
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with 'Bad Request' when trying to post a blank comment", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: "lurker",
                body: null,
              })
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with 'Bad Request' when trying to send a post request with one or more fields missing", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: "lurker",
              })
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("201: ignores unnecessary extra keys in request", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: "lurker",
                body: "I'm new here",
                spooky: "this should not be here",
              })
              .expect(201);

            expect(body.comment).toMatchObject({
              article_id: 9,
              author: "lurker",
              body: "I'm new here",
              comment_id: expect.any(Number),
              created_at: expect.any(String),
              votes: 0,
            });
          });
          it("400: responds with 'Bad Request' if send incorrect keys in request", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: "lurker",
                what_the_comment_says: "first",
              })
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with 'Bad Request' when trying to post comment which is not in the correct data type", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: "lurker",
                body: false,
              })
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
          it("400: responds with 'Bad Request' when attempting to post with too many characters in comment body", async () => {
            const { body } = await request(app)
              .post("/api/articles/9/comments")
              .send({
                username: "lurker",
                body: ".".repeat(501),
              })
              .expect(400);

            expect(body.msg).toBe("Bad Request");
          });
        });
      });
    });
  });
  describe("/api/comments/:comment_id", () => {
    describe("DELETE", () => {
      it("204: deletes the comment with specified comment_id", async () => {
        const {
          body: {
            article: { comment_count: originalCommentCount },
          },
        } = await request(app).get("/api/articles/9");

        const { body } = await request(app)
          .delete("/api/comments/1")
          .expect(204);

        const {
          body: { comments: commentsAfterDelete },
        } = await request(app).get("/api/articles/9/comments");

        expect(body).toEqual({});
        expect(originalCommentCount - 1).toBe(
          parseInt(commentsAfterDelete.length)
        );
        expect(commentsAfterDelete.length).toBeGreaterThan(0);
        commentsAfterDelete.forEach((object) => {
          expect(object.comment_id).not.toBe(1);
        });
      });
      it("404: responds with a 'Sorry, that is not found' if attempt to delete a valid comment_id which does not exist ", async () => {
        const { body } = await request(app)
          .delete("/api/comments/1000001")
          .expect(404);

        expect(body.msg).toBe("Sorry, that is not found");
      });
      it("400: responds with 'Bad Request' if attempt to delete an invalid comment_id", async () => {
        const { body } = await request(app)
          .delete("/api/comments/not_valid_id")
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
    });
    describe("PATCH", () => {
      it("200: increments vote count in specified comment by amount provided in request body where original votes are 0, and responds with the updated comment", async () => {
        const { body } = await request(app)
          .patch("/api/comments/11")
          .send({ inc_votes: 12 })
          .expect(200);

        const { rows } = await db.query(
          `SELECT votes FROM comments WHERE comment_id = 11`
        );
        expect(rows[0].votes).toBe(12);
        expect(body.comment).toMatchObject({
          comment_id: 11,
          author: "icellusedkars",
          body: "Ambidextrous marsupial",
          created_at: expect.any(String),
          votes: 12,
        });
      });
      it("200: increments vote count where original votes were more than 0", async () => {
        const { body } = await request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 250 })
          .expect(200);

        const { rows } = await db.query(
          `SELECT votes FROM comments WHERE comment_id = 1`
        );
        expect(rows[0].votes).toBe(266);
        expect(body.comment.votes).toBe(266);
      });
      it("200: does not increment vote count on any other comment", async () => {
        const { body } = await request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 90 })
          .expect(200);

        const { rows } = await db.query(
          `SELECT votes FROM comments WHERE comment_id = 17;`
        );

        expect(rows[0].votes).toBe(20);
      });
      it("200: ignores unnecessary extra keys in request", async () => {
        const { body } = await request(app)
          .patch("/api/comments/4")
          .send({
            inc_votes: -14,
            spooky: "Why?",
          })
          .expect(200);

        expect(body.comment).toMatchObject({
          comment_id: 4,
          author: "icellusedkars",
          body: " I carry a log — yes. Is it funny to you? It is not to me.",
          created_at: expect.any(String),
          votes: -114,
        });
      });
      it("404: returns a custom 'not found' error message for valid but non-existent comment_id", async () => {
        const { body } = await request(app)
          .patch("/api/comments/840")
          .send({ inc_votes: 70 })
          .expect(404);

        expect(body.msg).toBe("Sorry, that is not found");
      });
      it("400: returns with 'Bad Request' for invalid comment_id", async () => {
        const { body } = await request(app)
          .patch("/api/comments/string_NaN")
          .send({ inc_votes: 70 })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when anything other than a number is sent on the inc_votes key, and does not update the comment's votes", async () => {
        let { body } = await request(app)
          .patch("/api/comments/3")
          .send({ inc_votes: [4] })
          .expect(400);

        expect(body.msg).toBe("Bad Request");

        const { rows } = await db.query(
          `SELECT votes FROM comments WHERE comment_id = 3`
        );
        expect(rows[0].votes).toBe(100);
      });
      it("400: responds with 'Bad Request' when attempting to PATCH with inc_votes as NaN", async () => {
        const { body } = await request(app)
          .patch("/api/comments/3")
          .send({
            inc_votes: NaN,
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to PATCH with inc_votes as null", async () => {
        const { body } = await request(app)
          .patch("/api/comments/3")
          .send({
            inc_votes: null,
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' when attempting to PATCH with inc_votes missing", async () => {
        const { body } = await request(app)
          .patch("/api/comments/3")
          .send({})
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
      it("400: responds with 'Bad Request' if incorrect key sent in request", async () => {
        const { body } = await request(app)
          .patch("/api/comments/3")
          .send({
            increase_the_votes_by: 4,
          })
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
    });
  });
  describe("/api/users", () => {
    describe("GET", () => {
      it("200: responds with an array of objects all user's usernames", async () => {
        const {
          body: { users },
        } = await request(app).get("/api/users").expect(200);

        expect(users).toBeInstanceOf(Array);
        expect(users.length).toBeGreaterThan(0);

        users.forEach((user) => {
          expect(user).toEqual({
            username: expect.stringMatching(
              /^(butter_bridge|icellusedkars|rogersop|lurker)$/
            ),
          });
        });
      });
    });
    describe("/api/users/:username", () => {
      describe("GET", () => {
        it("200: responds with the specified user object", async () => {
          const { body } = await request(app)
            .get("/api/users/rogersop")
            .expect(200);

          expect(body.user).toEqual({
            username: "rogersop",
            avatar_url:
              "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
            name: "paul",
          });
        });
        it("404: responds with a custom 'not found' error message for username that doesn't exist", async () => {
          const { body } = await request(app)
            .get("/api/users/not_a_username")
            .expect(404);

          expect(body.msg).toBe("Sorry, that is not found");
        });
      });
    });
  });
});
