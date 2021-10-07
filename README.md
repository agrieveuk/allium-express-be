# The Allium-Express News API

## Summary

This project is a RESTful API which will serve article, comment, user and topic data from an SQL database. The CRUD endpoints will allow a front end application to provide the means for users to interact with data for a Reddit style application.

Please find a link to the hosted version of this API on Heroku [here](https://nc-express-news.herokuapp.com/api).

Please also find links below for my front end to this application, The Allium!

[Github repo](https://github.com/agrieveuk/allium-express)

[The Allium webapp on Netlify](https://theallium.netlify.app/)

---

## Minimum Versions

Node - v16.4.2

Postgres - v12.8

---

## Instructions

### Cloning the repository

- In your terminal, use the `cd` command to navigate to the directory in which you would like to store this git repository
- From there, run

```
git clone https://github.com/agrieveuk/be-nc-news.git
```

- login with your git credentials
- When the installation completes, cd into the new directory

---

### Environment Variables

To be able to run, two files must be created in the root level of the directory named `.env.development` and `.env.test`.

Inside, the names of the local development and test databases will be defined as variables as follows: `PGDATABASE=database_name`. See the file [setup.sql](./db/setup.sql) for the database names and [.env.example](./.env.example) for reference.

---

### Setup & Using the API

> When in the directory:

To install dependencies, run:

```
npm install
```

To create test & development databases, run:

```
npm run setup-dbs
```

To seed development database with data, run:

```
npm run seed
```

To runs tests with Jest, run:

```
npm test
```

or to only run specific test files, append the name of the test file after this command (this uses regex) eg:

```
npm test app
```

To start the server listening to be able to make requests, run:

```shell
npm start
```

You can now make requests to this API and receive a response from your local database! Please see [endpoints.json](./endpoints.json) for a list of available endpoints with details and example data responses.

---

Thank you!
