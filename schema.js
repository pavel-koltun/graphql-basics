const fetch = require('node-fetch');
const {promisify} = require('util');
const parseXML = promisify(require('xml2js').parseString);
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} = require('graphql');

const API_KEY = 'vUES5r9cSRna9CdS2xTyA';

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: (xml) => xml.GoodreadsResponse.book[0].title[0],
    },
    isbn: {
      type: GraphQLString,
      resolve: (xml) =>
        typeof xml.GoodreadsResponse.book[0].isbn[0] === 'string'
          ? xml.GoodreadsResponse.book[0].isbn[0] : null,
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: '...',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: (xml) =>
        xml.GoodreadsResponse.author[0].name[0],
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: (xml) => {
        const ids = xml.GoodreadsResponse.author[0].books[0].book
          .map((elem) => elem.id[0]._);

        return Promise.all(
          ids.map((id) => fetch(`https://www.goodreads.com/book/show/${id}.xml?key=${API_KEY}`)
            .then((response) => response.text())
            .then(parseXML))
        );
      },
    },
  }),
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',
    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: {type: GraphQLInt},
        },
        resolve: (root, args) => fetch(
          `https://www.goodreads.com/author/show.xml?id=${args.id}&key=${API_KEY}`
        ).then((response) => response.text())
        .then(parseXML),
      },
    }),
  }),
});
