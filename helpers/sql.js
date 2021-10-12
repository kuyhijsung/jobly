const {
  BadRequestError
} = require("../expressError");

/**
 * This is a helper function in order to make partial updates to the database using the Javascript data fields that were provided in the parameter. 
 * 
 * @param {Object} dataToUpdate Holds the values from the data that you want to update.
 * @param {Object} jsToSql Holds Javascript data fields which will be used to create the database column names.
 *  
 * @returns {Object} Returns an object which contains the newly set value entries for the database. 
 * @example {firstName: 'Aliya', age: 32} => {setCols: '"first_name" = $1, "age" = $2', values: ['Aliya', 32]}
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = {
  sqlForPartialUpdate
};