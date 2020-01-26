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
        VALUES($1, $2, $3) RETURNING *`,
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
        text: `SELECT * FROM users WHERE email=$1`,
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
      const findUserQuery = {
        text: `SELECT id, email, fullname, bio FROM users WHERE id=$1`,
        values: [id],
      };
      try {
        const user = await postgres.query(findUserQuery);
        if (!user) throw "User was not found.";
        return user;
      } catch (e) {
        throw "User or Password was incorrect.";
      }
    },
    async getItems(idToOmit) {
      const items = await postgres.query({
        text: `SELECT * FROM items WHERE ownerid!=$1`,
        values: idToOmit ? [idToOmit] : [],
      });
      return items.rows;
    },
    async getItemsForUser(id) {
      const items = await postgres.query({

        text: `SELECT * FROM items WHERE ownerid=$1`,
        values: [id],
      });
      return items.rows;
    },
    async getBorrowedItemsForUser(id) {
      const items = await postgres.query({
        text: `SELECT * FROM items WHERE borrowid=$1`,
        values: [id],
      });
      return items.rows;
    },
    async getTags() {
      const tags = await postgres.query({
        text: `SELECT * FROM tags`,
      });
      return tags.rows;
    },
    async getTagsForItem(id) {
      const tagsQuery = {
        text: `SELECT *
        FROM tags INNER JOIN itemtags 
        ON tags.id = itemtags.tagid
        WHERE itemtags.itemid=$1`,
        values: [id],
      };

      const tags = await postgres.query(tagsQuery);
      return tags.rows;
    },

    async saveNewItem({ item, user }) {

      return new Promise((resolve, reject) => {
        /** */
        postgres.connect((err, client, done) => {
          try {
            client.query("BEGIN", async err => {
              const { title, description, tags } = item;

              const createItemQuery = {
                text: `INSERT INTO items (title, description, ownerid) VALUES ($1, $2, $3) returning *;`
                ,
                values: [title, description, user.id],
              };
              const newItem = await postgres.query(createItemQuery);
              const itemid = newItem.rows[0].id;
              let itemTagsValue = tagsQueryString([...tags], itemid, results)
              const createItemtagsQuery = {
                text: `INSERT INTO itemtags (itemid, tagid) VALUES ${values}`
                ,
                values: tags.map(tag => tag.id),
              };
              client.query("COMMIT", err => {
                if (err) {
                  throw err;
                }
                done();
                resolve(newItem.rows[0])
                // -------------------------------
              });
            });
          } catch (e) {
            client.query("ROLLBACK", err => {
              if (err) {
                throw err;
              }
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
