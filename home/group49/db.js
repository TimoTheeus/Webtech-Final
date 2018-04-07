//This file is for interacting with the database.
var db = new require('sqlite3').Database('data.db');

//The superclass of all db table classes. Do not use directly, use one of the subclasses instead.
class DBItem {
    /*Create a database item with the specified id (as an int) and parameters (as an object with column names as the keys).
    You can leave params empty if you want to select by id, leave id empty if you want to insert,
    or leave both empty if you want to selectMany.
    Note: Subclasses have to define this.cols (containing the column names) before calling this constructor
    and this.table (containing the table name) after. All other properties can but don't have to be redefined afterwards.*/
    constructor(id, params) {
        this.table = ''; //the table name
        this.idName = 'id'; //the name of the id column in the database
        this.id = id; //the id number
        if (!(params && Array.isArray(this.cols) && this.cols.length))
            this.props = params || {}; //no cols (or params) specified, just use params directly
        else { //otherwise check if all the keys in params are a column, if not throw an error
            Object.keys(params).forEach(key => {
                if (this.cols.includes(key))
                    this.props[key] = params[key];
                else
                    throw new Error(key + ' is not a column of ' + this.table);
            });
        }
    }
    /*Select the row with the id specified in the constructor, and change this.props to the properties of this row.
    callback will be called when this is finished with the changed object as parameter.*/
    select(callback) {
        db.get('SELECT * FROM ? WHERE ? = ?;', this.table, this.idName, this.id, (err, row) => {
            if (row) 
                Object.keys(row).forEach(key => if (key != this.idName) this.props[key] = row[key];
            callback(this); 
        });
    }
    /*Select the row(s) where row[prop] = value, then create objects representing these rows.
    callback will be called with an array of the created objects as parameter.*/
    selectMany(prop, value, callback) {    
        db.all('SELECT * FROM ? WHERE ? = ?;', this.table, prop, value, (err, rows) => {
            var result = [];
            if (rows)
                result = rows.map(row => {
                    var id = row[this.idName];
                    delete row[this.idName];
                    result.push(new this.constructor(id, row));
            });
            callback(result);
        });
    }
    /*Inserts a row into the database with this object's properties as values. id is automatically decided.
    callback will be called with the current object as parameter, this.id will contain the generated id.*/
    insert(callback) {
        var placeholders = '(?' + ', ?'.repeat(this.props.length - 1) + ')';
        db.run('INSERT INTO ? ' + placeholders + ' VALUES ' + placeholders + ';', this._params(true), err => {
            if (!err && callback) db.get('SELECT last_insert_rowid() FROM ?', this.table, (err, row) => {
                if (row) this.id = row[idName];
                callback(this);
            });
        });
    }
    /*Updates the row with this.id as id to contain this object's properties.
    No callback because the object isn't changed. (Although it could be added if needed.)*/
    update() {
        var placeholders = '? = ?' + ', ? = ?'.repeat(this.props.length - 1);
        db.run('UPDATE ? SET ' + placeholders + ' WHERE ? = ?;',
            this._params(false).concat([this.idName, this.id]);
    }
    /*Help function to create the queries needed for insert and update.
    Has no use outside of these functions.
    insert is a bool specifying if it was called from insert (true) or update (false).*/
    _params(var insert) {
        var params = [this.table];
        for (var i = 1; i <= this.cols.length; i++) {
            var i1, i2;
            if (insert) {
                i1 = i;
                i2 = i + this.cols.Length;
            } else {
                i1 = 2 * i - 1;
                i2 = i1 + 1;
            }
            params[i1] = this.cols[i];
            params[i2] = this.props[this.cols[i]];
        }
        return params;
    }
}
//Represents a user, or a row in the Users table.
class User extends DBItem {
    constructor(id, params) {
        this.cols = ['login', 'password', 'first_name', 'last_name', 'email'];
        super(id, params);
        this.table = 'Users'
    }
}
//Represents a product, or a row in the Products table.
class Product extends DBItem {
    constructor(id, params) {
        this.cols = ['title', 'manufacturer', 'price', 'image', 'description'];
        super(id, params);
        this.table = 'Products';
    }
    /*Get all the categories this product belongs to.
    callback will be called with an array of category names (strings) as parameter*/
    getCategories(callback) {
        catobj = new ProdCategory();
        catobj.selectMany('prodid', this.id, objs => callback(objs.map(x => x.props.category)));
    }
}
//Represents a purchase, or a row in the Purchases table.
class Purchase extends DBItem {
    constructor(id, params) {
        this.cols = ['userid', 'prodid'];
        super(id, params);
        this.table = 'Purchases';
    }
}
//Represents a row in the Categories table.
//Usually created like new ProdCategory() (without parameters) because individual rows don't have much value.
class ProdCategory extends DBItem {
    constructor(id, params) {
        this.cols = ['prodid', 'category'];
        super(id, params);
        this.table = 'Categories';
    }
    /*Get all categories that exist. callback will be called with an array of category names (strings).*/    
    getCategories(callback) {
        db.all('SELECT DISTINCT category FROM ?;', this.table, objs => callback(objs.map(x => x.category)));
    }
    /*Get all products that belong to the category given as the first argument.
    callback will be called with an array of Products. sel is a boolean indicating if the properties of the
    Products are important. If true, the select method will be called and all of the properties will be available.
    Otherwise only the id will be available until you call select yourself. Because this method uses object properties,
    don't call it twice on the same object unless you're sure it's been completed.*/
    getItems(category, callback, sel) {
        this.i = 0;
        this.items = [];
        this.callback = callback;
        db.all('SELECT prodid FROM ? WHERE category = ?;', this.table, category, objs => {
            this.length = objs.length;
            for (var i = 0; i < this.length, i++) {
                this.items[i] = new Product(objs[i].prodid);
                if (sel) this.items[i].select(this._inc);
            }
            if (sel) this._inc();
            else callback(this.items);
        });
    }
    /*Help function that increases this.i when a Product.select call is done.
    Once all calls are done, calls the callback function. Only for use in getItems.*/
    _inc() {
        this.i++;
        if (this.i == this.length)
            this.callback(this.items);
    }
}
//Closes the database. Call this when you are done with all the queries you wanted to do.
function close() {
    db.close();
}