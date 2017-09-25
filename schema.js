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

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: (book) => book.title[0],
    },
    isbn: {
      type: GraphQLString,
      resolve: (book) => typeof book.isbn[0] === 'string' ? book.isbn[0] : null,
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
      resolve: (xml) =>
        xml.GoodreadsResponse.author[0].books[0].book,
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
          `https://www.goodreads.com/author/show.xml?key=vUES5r9cSRna9CdS2xTyA&id=${args.id}`
        ).then((response) => response.text())
        .then(parseXML),
      },
    }),
  }),
});
