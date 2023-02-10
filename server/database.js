const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require("pg");

const pool = new Pool({
  user: "labber",
  password: "123",
  host: "localhost",
  database: "lightbnb",
});
pool.query(`SELECT title FROM properties LIMIT 10;`).then((response) => {
  console.log(response);
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1;`, [id])
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(
      `INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`,
      [user.name, user.email, user.password]
    )
    .then((result) => {
      console.log(result.rows);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
/// Properties

const getAllReservations = function (guest_id, limit = 10) {
  console.log(guest_id);
  return pool
    .query(
      `
    SELECT reservations.*, properties.*, avg(property_reviews.rating) as average_rating
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1 
    GROUP BY properties.id, reservations.id
    ORDER BY reservations.start_date
    LIMIT $2;`,
      [guest_id, limit]
    )

    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  const queryParams = [];
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) AS average_rating
  FROM properties
  LEFT JOIN property_reviews ON properties.id = property_id;`;

  // if (Object.keys(options).length > 1) {
  //   let queriesAdded = false;

    if (options.city) {
      if (!queriesAdded) {
        queryString += `WHERE`;
        queriesAdded = true;
      }
      queryParams.push(`%${options.city}%`);
      queryString += `WHERE city LIKE $${queryParams.length} `;
    }

  //   if (options.owner_id) {
  //     if (!queriesAdded) {
  //       queryString += `
  //     WHERE `;
  //       queriesAdded = true;
  //     }
  //     queryParams.push(`${options.owner_id}`);
  //     queryString += ` properties.owner_id = $${queryParams.length} AND `;
  //   }

  //   if (options.minimum_price_per_night) {
  //     if (!queriesAdded) {
  //       queryString += `
  //     WHERE `;
  //       queriesAdded = true;
  //     }
  //     queryParams.push(`${options.minimum_price_per_night * 100}`);
  //     queryString += ` properties.cost_per_night >= $${queryParams.length} AND `;
  //   }

  //   if (options.maximum_price_per_night) {
  //     if (!queriesAdded) {
  //       queryString += `
  //     WHERE `;
  //       queriesAdded = true;
  //     }
  //     queryParams.push(`${options.maximum_price_per_night * 100}`);
  //     queryString += ` properties.cost_per_night <= $${queryParams.length} AND `;
  //   }

  //   if (queriesAdded) {
  //     queryString = queryString.slice(0, -4);
  //   }
  // }

  // queryParams.push(limit);
  // queryString += `
  // GROUP BY properties.id
  // ORDER BY cost_per_night
  // LIMIT $${queryParams.length};`;


  // queryString += `
  // GROUP BY properties.id`;
  // if (options.minimum_rating) {
  //   queryParams.push(`${options.minimum_rating}`);
  //   queryString += `
  // HAVING avg(rating) >= $${queryParams.length}`;
  // }
  // queryParams.push(limit);
  // queryString += `
  // ORDER BY cost_per_night
  // LIMIT $${queryParams.length};`;

  

  console.log(queryString, queryParams);

  return pool.query(queryString, queryParams).then((res) => res.rows);
};

exports.getAllProperties = getAllProperties;

// const getAllProperties = (options, limit = 10) => {
//   return pool
//     .query(`
//     SELECT properties.*, avg(property_reviews.rating) as average_rating
//     FROM properties
//     JOIN property_reviews ON properties.id = property_id
//     WHERE city LIKE '%ancouv%'
//     GROUP BY properties.id
//     HAVING avg(property_reviews.rating) >= 4
//     ORDER BY cost_per_night
//     LIMIT $1;`, [limit])
//     .then((result) => {
//       console.log(result.rows);
//       return result.rows;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
// };

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;

// return pool
//     .query(`SELECT * FROM properties LIMIT $1`, [limit])
//     .then((result) => {
//       console.log(result.rows);
//       return result.rows;
//     })
//     .catch((err) => {
//       console.log(err.message);
//     });
