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
    });
    describe("PATCH /:article", () => {
      it("200: increments vote count in specified article by amount provided in request body, and responds with the updated article", async () => {
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
    });
  });
});
