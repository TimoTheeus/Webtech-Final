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
        this.cols = Array.isArray(cols) ? cols : [];
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
                }
                else callback();
            });
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
    Callback is called without parameters when the action is complete.*/
    update(callback) {
        if (this.propNames.length == 0) return;
        var placeholders = this.propNames[0] + ' = ?';
        for (var i = 0; i < this.propNames.length; i++)
            placeholders += `, ${propNames[i]} = ?`
        db.run(`UPDATE ${this.table} SET ${placeholders} WHERE ${this.idName} = ?;`, this.propValues.concat([this.id]),
            (err, row) => callback());
    }
    /*Deletes the row with this.id as id from the database.
    Callback is called without parameters when the action is complete.*/
    delete(callback) {
        db.run(`DELETE FROM ${this.table} WHERE ${this.idName} = ?;`, this.id, (err, row) => callback());
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
            super(id, params, ['title', 'manufacturer', 'price', 'image', 'description']);
            this.table = 'Products';
        }
        /*Get all the categories this product belongs to.
        callback will be called with an array of category names (strings) as parameter*/
        getCategories(callback) {
            catobj = new ProdCategory();
            catobj.selectMany('prodid', this.id, objs => callback(objs.map(x => x.props.category)));
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
    //Usually created like new ProdCategory() (without parameters) because individual rows don't have much value.
    ProdCategory: class extends DBItem {
        constructor(id, params) {
            super(id, params, ['prodid', 'category']);
            this.table = 'Categories';
        }
        /*Get all categories that exist. callback will be called with an array of category names (strings).*/    
        getCategories(callback) {
            db.all(`SELECT DISTINCT category FROM ${this.table};`, objs => callback(objs.map(x => x.category)));
        }
        /*Get all products that belong to the category given as the first argument.
        callback will be called with an array of Products. sel is a boolean indicating if the properties of the
        Products are important. If true, the select method will be called and all of the properties will be available.
        Otherwise only the id will be available until you call select yourself.*/
        getItems(category, callback, sel) {
            var i = 0;
            var items = [];
            var length = 0;
            /*Help function that increases i when a Product.select call is done.
            Once all calls are done, calls the callback function.*/
            function f() {
                i++;
                if (i == length)
                    callback(items);
            }
            db.all(`SELECT prodid FROM ${this.table} WHERE category = ?;`, category, objs => {
                length = objs.length;
                for (var j = 0; j < length; j++) {
                    items[j] = new Product(objs[j].prodid);
                    if (sel) items[j].select(f);
                }
                if (sel) f();
                else callback(this.items); //no select calls to wait for, call callback directly
            });
        }
    },
    //Closes the database. Call this when you are done with all the queries you wanted to do.
    close: db.close
};