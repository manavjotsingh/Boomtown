const { gql } = require("apollo-server-express");

module.exports = gql`
  scalar Date

  input SignUpInput {
    fullname: String!
    email: String!
    password: String!
  }
  input LogInInput{
    email: String!
    password: String!
  }
  type Item {
    id: ID!
    title: String!
    imageurl: String
    description: String!
    itemowner: User!
    tags: [Tag]
    created: Date!
    borrower: User
  }

  type User {
    id: ID!
    email: String!
    fullname: String!
    userimageurl: String
    bio: String
    items: [Item]
    borrowed: [Item]
  }

  type Tag {
    id: ID!
    title: String!
  }

  type AuthPayload {
    token: String
    user: User
  }

  input AssignedTag {
    id: ID!
    title: String!
  }

  input AssignedBorrower {
    id: ID!
  }

  input NewItemInput {
    title: String!
    description: String!
    tags: [AssignedTag]!
  }

  type Query {
    user(id: ID!): User
    viewer: User
    items(filter: ID): [Item]
    tags: [Tag]
  }

  type Mutation {
    signup(user: SignUpInput): AuthPayload!
    login(user: LogInInput): AuthPayload!
    logout: Boolean!
    addItem(input: NewItemInput!): Item
  }
`;


