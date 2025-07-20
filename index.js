import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// Database - Mock database with games, reviews, and authors data
import db from './_db.js';

// Types - Import GraphQL schema definitions
import { typeDefs } from './schema.js';

// Resolvers - Functions that handle GraphQL queries and mutations
const resolvers = {
    // Query resolvers - Handle read operations
    Query: {
        // Get all games
        games() {
            return db.games
        },
        // Get a game by ID
        game(_, args) {
            return db.games.find((game) => game.id === args.id)
        },
        // Get all reviews
        reviews() {
            return db.reviews
        },
        // Get a review by ID
        review(_, args) {
            return db.reviews.find((review) => review.id === args.id)
        },
        // Get all authors
        authors() {
            return db.authors
        },
        // Get an author by ID
        author(_, args) {
            return db.authors.find((author) => author.id === args.id)
        }
    },
    // Game type resolver - Handle nested fields for Game objects
    Game: {
        // Get all reviews for a specific game
        reviews(parent) {
            return db.reviews.filter((r) => r.game_id === parent.id)
        }
    },
    // Author type resolver - Handle nested fields for Author objects
    Author: {
        // Get all reviews written by a specific author
        reviews(parent) {
            return db.reviews.filter((r) => r.author_id === parent.id)
        }
    },
    // Review type resolver - Handle nested fields for Review objects
    Review: {
        // Get the author who wrote this review
        author(parent) {
            return db.authors.find((a) => a.id === parent.author_id)
        },
        // Get the game that this review is about
        game(parent) {
            return db.games.find((g) => g.id === parent.game_id)
        }
    },
     // Mutation resolvers - Handle write operations (add, delete, update)
    Mutation: {
        // Add a new game
        addGame(_, args) {
            let game = {
                ...args.game,   // Spread the game data from arguments
                id: Math.floor(Math.random() * 10000)   // Generate random ID
            }
            // Add to database games array
            db.games.push(game)
            return game
        },
        // Delete a game
        deleteGame(_, args) {
            // Filter out the game with the specified ID
            db.games = db.games.filter((g) => g.id !== args.id)
            return db.games
        },
        // Update a game
        updateGame(_, args) {
            // Map through games and update the matching one
            db.games = db.games.map((g) => {
                if (g.id == args.id) {
                    // Merge existing game with updates
                    return {...g, ...args.updates}
                }
                // Return unchanged game
                return g
            })
            // Return the updated game
            return db.games.find((g) => g.id == args.id)
        }
    }
};

// Server setup
const server = new ApolloServer({
    typeDefs,
    resolvers
});

// Start the server on port 4000
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});

// Log the server URL when it's ready
console.log(`Server ready at: ${url}`);
