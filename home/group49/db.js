//This file is for interacting with the database.
var sql = require('sqlite3').verbose();
var db = new sql.Database('data.db');

//The superclass of all db table classes. Do not use directly, use one of the subclasses instead.
class DBItem {
    /*Create a database item with the specified id (as an int) and parameters (as an object with column names as the keys).
    You can leave params empty if you want to select by id, leave id empty if you want to insert,
    or leave both empty if you want to selectMany. cols contains an array with column names and
    is defined in the subclasses.*/
    constructor(id, params, cols) {
        this.cols = cols;
        this.table = ''; //the table name
        this.idName = 'id'; //the name of the id column in the database
        this.id = id; //the id number
        //this.propNames and this.propValues contain the same information as this.props, but in a different format.
        this.propNames = [];
        this.propValues = [];
        this.props = new Proxy({}, {set: (obj, key, value) => {
            if (!(key in obj)) {
                this.propNames.push(key);
                this.propValues.push(value);
            }
            obj[key] = value;
            return true;
        }});
        if (typeof params == 'object')
            Object.keys(params).forEach(key => {
                if (cols.includes(key)) this.props[key] = params[key];
                else throw new Error(key + ' is not a column of ' + this.table);
            });
    }
    /*Select the row with the id specified in the constructor, and change this.props to the properties of this row.
    callback will be called when this is finished with the changed object as parameter.*/
    select(callback) {
        db.get(`SELECT * FROM ${this.table} WHERE ${this.idName} = ?;`, this.id, (err, row) => {
            if (row)
                Object.keys(row).forEach(key => {
                    if (key != this.idName) this.props[key] = row[key];
                });
            callback(this); 
        });
    }
    /*Select the row(s) where row[prop] = this.props[prop] (given in constructor), then create objects representing
    these rows. callback will be called with an array of the created objects as parameter.*/
    selectMany(prop, callback) {
        if (!this.props[prop])
            console.log('No such prop: ' + prop);
        else
            db.all(`SELECT * FROM ${this.table} WHERE ${prop} = ?;`, this.props[prop], (err, rows) => {
                var result = [];
                if (rows)
                    result = rows.map(row => {
                        var id = row[this.idName];
                        delete row[this.idName];
                        return new this.constructor(id, row);
                });
                callback(result);
            });
    }
    /*Like selectMany, but give multiple options for the property's values instead of just one in the constructor.
    All objects where the requested property is equal to one of the options will be selected.*/
    selectManyOptions(prop, options, callback) {
        if (!this.cols.includes(prop))
            console.log('No such prop: ' + prop);
        else
            db.all(`SELECT * FROM ${this.table} WHERE ${prop} IN (?${', ?'.repeat(options.length - 1)});`, options, (err, rows) => {
                var result = [];
                if (rows)
                    result = rows.map(row => {
                        var id = row[this.idName];
                        delete row[this.idName];
                        return new this.constructor(id, row);
                });
                callback(result);
            });
    }
    /*Like selectManyOptions, but instead of a list of options give a range that values must be between.
    range should be an array where the first value is the lower limit and the second value is the upper limit.*/
    selectManyRange(prop, range, callback) {
        if (!this.cols.includes(prop))
            console.log('No such prop: ' + prop);
        else
            db.all(`SELECT * FROM ${this.table} WHERE ${prop} BETWEEN ? AND ?`, range, (err, row) => {
                var result = [];
                if (rows)
                    result = rows.map(row => {
                        var id = row[this.idName];
                        delete row[this.idName];
                        return new this.constructor(id, row);
                });
                callback(result);
            });
    }
    /*Like selectMany, but will only select the first result row.
    callback will be called with the single created object or undefined if no rows were selected.*/
    selectSingle(prop, callback) {
        if (!this.props[prop])
            console.log('No such prop: ' + prop);
        else
            db.get(`SELECT * FROM ${this.table} WHERE ${prop} = ?;`, this.props[prop], (err, row) => {
                if (row) {
                    var id = row[this.idName];
                    delete row[this.idName];
                    callback(new this.constructor(id, row));
                } else callback();
            });
    }
    /*Gets all possible values for a certain column in the table.
    callback will be called with an array of values for that column.*/
    getAll(prop, callback) {
        if (!this.cols.includes(prop))
            console.log('No such prop: ' + prop);
        else
            db.all(`SELECT DISTINCT ${prop} FROM ${this.table};`, (err, rows) => callback(rows.map(x => x[prop])));
    }
    /*Inserts a row into the database with this object's properties as values. id is automatically decided.
    callback will be called with the current object as parameter, this.id will contain the generated id.*/
    insert(callback) {
        var placeholders = '(?' + ', ?'.repeat(this.propValues.length - 1) + ')';
        var obj = this;
        db.run(`INSERT INTO ${this.table} (${this.propNames.join(', ')}) VALUES ${placeholders};`, this.propValues, function() {
            obj.id = this.lastID;
            callback(obj);
        });
    }
    /*Updates the row with this.id as id to contain this object's properties.
    callback is called without parameters when the action is complete.*/
    update(callback) {
        if (this.propNames.length == 0) return;
        var placeholders = this.propNames[0] + ' = ?';
        for (var i = 0; i < this.propNames.length; i++)
            placeholders += `, ${propNames[i]} = ?`
        db.run(`UPDATE ${this.table} SET ${placeholders} WHERE ${this.idName} = ?;`, this.propValues.concat([this.id]),
            (err, row) => callback());
    }
    /*Deletes the row with this.id as id from the database.
    callback is called without parameters when the action is complete.*/
    delete(callback) {
        db.run(`DELETE FROM ${this.table} WHERE ${this.idName} = ?;`, this.id, (err, row) => callback());
    }
}

//Represents the ProdToCat table. Only used for connecting Category objects with Product objects, so no need to export.
class ProdToCat extends DBItem {
    constructor(id, params) {
        super(id, params, ['prodid', 'catid']);
        this.table = 'ProdToCat';
    }
    /*Selects all possible combinations of categories that exist on a single product.
    callback is called with a result array of arrays, where every category id is mapped to
    an array of category ids that it exists in combination with.*/
    categoryCombs(callback) {
        db.all(`SELECT DISTINCT A.catid AS a, B.catid AS b FROM ${this.table} AS A
        JOIN ${this.table} AS B ON A.prodid = B.prodid AND A.catid <> B.catid;`, (err, rows) => {
            var result = [];
            rows.forEach(row => {
                if (!result[row.a])
                    result[row.a] = [row.b];
                else result[row.a].push(row.b);
            });
            callback(result);
        });
    }
}

module.exports = {
    //Represents a user, or a row in the Users table.
    User: class extends DBItem {
        constructor(id, params) {
            super(id, params, ['login', 'password', 'first_name', 'last_name', 'email']);
            this.table = 'Users'
        }
    },
    //Represents a product, or a row in the Products table.
    Product: class extends DBItem {
        constructor(id, params) {
            super(id, params, ['title', 'brand', 'price', 'image', 'description']);
            this.table = 'Products';
        }
        /*Get all the categories this product belongs to.
        callback will be called with an array of category names (strings) as parameter*/
        getCategories(callback) {
            catobj = new ProdCategory(null, {prodid: this.id});
            catobj.selectMany('prodid', objs => callback(objs.map(x => x.props.category)));
        }
    },
    //Represents a purchase, or a row in the Purchases table.
    Purchase: class extends DBItem {
        constructor(id, params) {
            super(id, params, ['userid', 'prodid']);
            this.table = 'Purchases';
        }
    },
    //Represents a row in the Categories table.
    Category: class extends DBItem {
        constructor(id, params) {
            super(id, params, ['category']);
            this.table = 'Categories';
        }
        /*Get all products that belong to this category.
        callback will be called with an array of Products. sel is a boolean indicating if the properties of the
        Products are important. If true, the select method will be called and all of the properties will be available.
        Otherwise only the id will be available until you call select yourself.*/
        getItems(callback, sel) {
            var i = 0;
            var items = [];
            var length = 0;
            /*Help function that increases i when a Product.select call is done.
            Once all calls are done, calls the callback function.*/
            function f() {
                i++;
                if (i == length + 1)
                    callback(items);
            }
            new ProdToCat(null, {catid: this.id}).selectMany('catid', objs => {
                length = objs.length;
                for (var j = 0; j < length; j++) {
                    items[j] = new module.exports.Product(objs[j].props.prodid);
                    if (sel) items[j].select(f);
                }
                if (sel) f();
                else callback(items); //no select calls to wait for, call callback directly
            });
        }
        /*Get all other categories that exist on the same product as this category.
        callback will be called with an array of Categories. sel is the same as for getItems,
        if it's false obj.props.category won't be available until you call select yourself.*/
        getCombs(callback, sel) {
            if (!this.id)
                this.selectSingle('category', obj => obj.getCombs(callback));
            else {
                //Same structure for optional selecting as getItems.
                //Copied to keep it within function scope and not have to use object variables.
                var i = 0;
                var items = [];
                var length = 0;
                function f() {
                    i++;
                    if (i == length + 1)
                        callback(items);
                }
                new ProdToCat().categoryCombs(arr => {
                    items = arr[this.id];
                    length = items.length;
                    for (var j = 0; j < length; j++) {
                        items[j] = new module.exports.Category(items[j]);
                        if (sel) items[j].select(f);
                    }
                    if (sel) f();
                    else callback(items);
                });
            }
        }
        /*Like getItems, but this time select all items that are part of one of the given categories,
        instead of only the current category. options can be an array of either category names or ids.*/
        getItemsOptions(options, callback, sel) {
            if (typeof options[0] == 'string')
                this.selectManyOptions('category', options, cats => getItemsOptions(x => x.id, callback, sel));
            else {
                var i = 0;
                var items = [];
                var length = 0;
                function f() {
                    i++;
                    if (i == length + 1)
                        callback(items);
                }
                new ProdToCat().selectManyOptions('catid', options, objs => {
                    length = objs.length;
                    for (var j = 0; j < length; j++) {
                        items[j] = new module.exports.Product(objs[j].props.prodid);
                        if (sel) items[j].select(f);
                    }
                    if (sel) f();
                    else callback(items); //no select calls to wait for, call callback directly
                });
            }
        }
    },
    //Closes the database. Call this when you are done with all the queries you wanted to do.
    close: db.close
};