const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */


//NEW CODE 
const getUserWithEmail = function(email) {
  return pool.query('SELECT * FROM users WHERE email = $1', [email])
  .then((result)  =>  {
    console.log(result.rows);
    return result.rows[0];
  })
  .catch((err)  =>  {
    console.log(err.message);
  });
}

exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithId = function(id) {
//   return Promise.resolve(users[id]);
// }

const getUserWithId = function(id)  {
  return pool.query('SELECT * FROM users WHERE id = $1', [id])
  .then((result)  =>  {
    console.log(result.rows);
    return result.rows[0];
  })
  .catch((err)  =>  {
    console.log(err.mesage);
  });
}

exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */


const addUser =  function(user) {
  const userName = user.name;
  const userEmail = user.email;
  const userPassword = user.password;

  // return pool.query(`INSERT INTO users (name, email, password) VALUES (${userName}, ${userEmail}, ${userPassword}) `, [user])
  return pool.query(`INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *;`, [userName, userEmail, userPassword])
  .then((result)  =>  {
    console.log(result.rows);
    Promise.resolve;
    return result.rows[0];
  })
  .catch((err)  =>  {
    console.log(err.mesage);
  });
}

exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */


const getAllReservations = function(guest_id) {
  const guestId = guest_id;

  return pool.query(`SELECT reservations.id, properties.title, properties.thumbnail_photo_url, properties.cover_photo_url, properties.cost_per_night, reservations.start_date, avg(rating) as average_rating
  FROM reservations
  JOIN properties ON reservations.property_id = properties.id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = $1
  GROUP BY properties.id, reservations.id
  ORDER BY reservations.start_date;`, [guestId])
  .then((result)  =>  {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err)  =>  {
    console.log(err.mesage);
  });
}

exports.getAllReservations = getAllReservations;



/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */


// REFACTOR
const getAllProperties = function (options, limit = 10) {
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  WHERE 1=1 `;

  

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `AND properties.city LIKE $${queryParams.length} `;
  }

  // if an owner_id is passed in, only return properties belonging to that owner.
  if (options.owner_id) {
    queryParams.push(`${options.owner_id}`);
    queryString += `AND owner_id LIKE $${queryParams.length} `;
  }

  // if a minimum_price_per_night and a maximum_price_per_night, only return properties within that price range. 
  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night}`);
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += `AND cost_per_night >= $${queryParams.length - 1} AND cost_per_night <= $${queryParams.length} `
  }

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `AND rating >= $${queryParams.length} `
  }

  // 4
  queryParams.push(limit);
  queryString += `
  GROUP BY properties.id
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(queryString, queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */


// REFACTROR ADD PROPERTY
const addProperty = function(property) {
  const ownerId = property.owner_id;
  const propTitle = property.title;
  const propDescription = property.description;
  const propThumbnail = property.thumbnail_photo_url;
  const propCoverPic = property.cover_photo_url;
  const nightlyCost = property.cost_per_night;
  const propertyStreet = property.street;
  const propCity = property.city;
  const propProvince = property.province;
  const postCode = property.post_code;
  const propCountry = property.country;
  const propParking = property.parking_spaces;
  const numBathrooms = property.number_of_bathrooms;
  const numBedrooms = property.number_of_bedrooms;

  let newArray = [ownerId, 
    propTitle, 
    propDescription, 
    propThumbnail, 
    propCoverPic, 
    nightlyCost,
    propertyStreet, 
    propCity, 
    propProvince, 
    postCode, 
    propCountry, 
    propParking, 
    numBathrooms, 
    numBedrooms];

    console.log(`New Array is ${newArray}`);


  return pool.query(`INSERT INTO properties 
    (owner_id, 
      title, 
      description, 
      thumbnail_photo_url, 
      cover_photo_url, 
      cost_per_night, 
      street, 
      city, 
      province, 
      post_code, 
      country, 
      parking_spaces, 
      number_of_bathrooms, 
      number_of_bedrooms) 
      VALUES 
        ($1, 
        $2, 
        $3, 
        $4, 
        $5, 
        $6, 
        $7, 
        $8, 
        $9, 
        $10, 
        $11, 
        $12, 
        $13,
        $14) 
        RETURNING *;`, 
        [ownerId, 
        propTitle, 
        propDescription, 
        propThumbnail, 
        propCoverPic, 
        nightlyCost,
        propertyStreet, 
        propCity, 
        propProvince, 
        postCode, 
        propCountry, 
        propParking, 
        numBathrooms, 
        numBedrooms])
  .then((result)  =>  {
    console.log(result.rows);
    Promise.resolve(result.rows[0]);
  })
  .catch((err)  =>  {
    console.log(err);
  });
}

exports.addProperty = addProperty;
