function tagsQueryString(tags, itemid, result) {
  for (i = tags.length; i > 0; i--) {
    result += `($${i}, ${itemid}),`;
  }
  return result.slice(0, -1) + ";";
}

module.exports = postgres => {
  return {
    async createUser({ fullname, email, password }) {
      const newUserInsert = {
        text: `INSERT INTO users(fullname, email, password) 
        VALUES($1, $2, $3) RETURNING *`, // @TODO: Authentication - Server
        values: [fullname, email, password],
      };
      try {
        const user = await postgres.query(newUserInsert);
        return user.rows[0];
      } catch (e) {
        switch (true) {
          case /users_fullname_key/.test(e.message):
            throw "An account with this username already exists.";
          case /users_email_key/.test(e.message):
            throw "An account with this email already exists.";
          default:
            throw "There was a problem creating your account.";
        }
      }
    },
    async getUserAndPasswordForVerification(email) {
      const findUserQuery = {
        text: `SELECT * FROM users WHERE email=$1`, // @TODO: Authentication - Server
        values: [email],
      };
      try {
        const user = await postgres.query(findUserQuery);
        if (!user) throw "User was not found.";
        return user.rows[0];
      } catch (e) {
        throw "User was not found.";
      }
    },
    async getUserById(id) {
      /**
       *  @TODO: Handling Server Errors
       *
       *  Inside of our resource methods we get to determine when and how errors are returned
       *  to our resolvers using try / catch / throw semantics.
       *
       *  Ideally, the errors that we'll throw from our resource should be able to be used by the client
       *  to display user feedback. This means we'll be catching errors and throwing new ones.
       *
       *  Errors thrown from our resource will be captured and returned from our resolvers.
       *
       *  This will be the basic logic for this resource method:
       *  1) Query for the user using the given id. If no user is found throw an error.
       *  2) If there is an error with the query (500) throw an error.
       *  3) If the user is found and there are no errors, return only the id, email, fullname, bio fields.
       *     -- this is important, don't return the password!
       *
       *  You'll need to complete the query first before attempting this exercise.
       */

      const findUserQuery = {
        text: `SELECT id, email, fullname, bio FROM users WHERE id=$1`, // @TODO: Basic queries
        values: [id],
      };

      /**
       *  Refactor the following code using the error handling logic described above.
       *  When you're done here, ensure all of the resource methods in this file
       *  include a try catch, and throw appropriate errors.
       *
       *  Ex: If the user is not found from the DB throw 'User is not found'
       *  If the password is incorrect throw 'User or Password incorrect'
       */
      try {
        const user = await postgres.query(findUserQuery);
        if (!user) throw "User was not found.";
        return user;
      } catch (e) {
        throw "User or Password was incorrect.";
      }
      // -------------------------------
    },
    async getItems(idToOmit) {
      const items = await postgres.query({
        /**
         *  @TODO:
         *
         *  idToOmit = ownerId
         *
         *  Get all Items. If the idToOmit parameter has a value,
         *  the query should only return Items were the ownerid !== idToOmit
         *
         *  Hint: You'll need to use a conditional AND/WHERE clause
         *  to your query text using string interpolation
         */

        text: `SELECT * FROM items WHERE ownerid!=$1`,
        values: idToOmit ? [idToOmit] : [],
      });
      return items.rows;
    },
    async getItemsForUser(id) {
      const items = await postgres.query({
        /**
         *  @TODO:
         *  Get all Items for user using their id
         */
        text: `SELECT * FROM items WHERE ownerid=$1`,
        values: [id],
      });
      return items.rows;
    },
    async getBorrowedItemsForUser(id) {
      const items = await postgres.query({
        /**
         *  @TODO:
         *  Get all Items borrowed by user using their id
         */
        text: `SELECT * FROM items WHERE borrowid=$1`,
        values: [id],
      });
      return items.rows;
    },
    async getTags(id) {
      const tags = await postgres.query({/* @TODO: Basic queries */
        text: `SELECT * FROM tags WHERE tagid=$1`,
        values: [id]
      });
      return tags.rows;
    },
    async getTagsForItem(id) {
      const tagsQuery = {
        text: `SELECT *
        FROM tags INNER JOIN itemtags 
        ON tags.id = itemtags.tagid
        WHERE itemtags.itemid=$1`, // @TODO: Advanced query Hint: use INNER JOIN
        values: [id],
      };

      const tags = await postgres.query(tagsQuery);
      return tags.rows;
    },





    /**
       *  @TODO: Adding a New Item
       *
       *  Adding a new Item requires 2 separate INSERT statements.
       *  
       *  All of the INSERT statements must:
       *  1) Proceed in a specific order.
       *  2) Succeed for the new Item to be considered added
       *  3) If any of the INSERT queries fail, any successful INSERT
       *     queries should be 'rolled back' to avoid 'orphan' data in the database.
       *
       *  To achieve #3 we'll ue something called a Postgres Transaction!
       *  The code for the transaction has been provided for you, along with
       *  helpful comments to help you get started.
       *
       *  Read the method and the comments carefully before you begin.
       */

    /**
             * Begin transaction by opening a long-lived connection
             * to a client from the client pool.
             * - Read about transactions here: https://node-postgres.com/features/transactions
             */



    async saveNewItem({ item, user }) {

      return new Promise((resolve, reject) => {
        /** */
        postgres.connect((err, client, done) => {
          try {
            // Begin postgres transaction
            client.query("BEGIN", async err => {
              const { title, description, tags } = item;
              // Generate new Item query
              // @TODO
              // -------------------------------
              const createItemQuery = {
                text: `INSERT INTO items (title, description, ownerid) VALUES ($1, $2, $3) returning *;`
                ,
                values: [title, description, user.id],
              };

              // Insert new Item
              const newItem = await postgres.query(createItemQuery);
              const itemid = newItem.rows[0].id;
              // return createItems.rows;
              // @TODO
              // -------------------------------

              // Generate tag relationships query (use the'tagsQueryString' helper function provided)
              // @TODO
              // -------------------------------
              let itemTagsValue = tagsQueryString([...tags], itemid, results)
              const createItemtagsQuery = {
                text: `INSERT INTO itemtags (itemid, tagid) VALUES ${values}`
                ,
                values: tags.map(tag => tag.id),
              };

              // Insert tags
              // @TODO
              // -------------------------------

              // Commit the entire transaction!
              client.query("COMMIT", err => {
                if (err) {
                  throw err;
                }
                // release the client back to the pool
                done();
                // Uncomment this resolve statement when you're ready!
                resolve(newItem.rows[0])
                // -------------------------------
              });
            });
          } catch (e) {
            // Something went wrong
            client.query("ROLLBACK", err => {
              if (err) {
                throw err;
              }
              // release the client back to the pool
              done();
            });
            switch (true) {
              default:
                throw e;
            }
          }
        });
      });
    },
  };
};
