const db = require("../db/connection.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");
require("jest-sorted");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api", () => {
  describe("/path-non-existent", () => {
    it("404: returns a custom 'not found' error message", async () => {
      const { body } = await request(app)
        .get("/api/path-non-existent")
        .expect(404);

      expect(body.msg).toBe("Sorry, that is not found");
    });
  });
  describe("/topics", () => {
    describe("GET", () => {
      it("200: returns an object with an array of topic objects on a key of topics", async () => {
        const { body } = await request(app).get("/api/topics").expect(200);

        expect(body.topics).toBeInstanceOf(Array);
        body.topics.forEach((topic) => {
          expect(topic).toMatchObject({
            description: expect.any(String),
            slug: expect.any(String),
          });
        });
      });
    });
  });
  describe("/articles", () => {
    describe("GET", () => {
      it("200: responds with an object containing an array of all article objects", async () => {
        const { body } = await request(app).get("/api/articles").expect(200);

        body.articles.forEach((article) => {
          expect(article).toMatchObject({
            article_id: expect.any(Number),
            title: expect.any(String),
            body: expect.any(String),
            votes: expect.any(Number),
            topic: expect.any(String),
            author: expect.any(String),
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

        body.articles.forEach((article) => {
          expect(article.topic).toBe("cats");
        });
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
      it("400: responds with bad request when an invalid topic is used in topic filter query", async () => {
        const { body } = await request(app)
          .get("/api/articles?topic=not_a_topic")
          .expect(400);

        expect(body.msg).toBe("Bad Request");
      });
    });
    describe("GET /:article", () => {
      it("200: accepts an article ID and responds with that article in an object on a key of article", async () => {
        const { body } = await request(app).get("/api/articles/5").expect(200);

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
    describe("PATCH /:article", () => {
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
    });
  });
});
