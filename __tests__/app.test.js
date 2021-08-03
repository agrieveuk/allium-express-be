const db = require("../db/connection.js");
const request = require("supertest");
const testData = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const app = require("../app.js");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api", () => {
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
  });
});
