var db = new require('sqlite3').Database('data.db');

class DBItem {
    constructor(id, params) {
        this.table = '';
        this.idName = 'id';
        this.id = id;
        if (!(params && Array.isArray(this.cols) && this.cols.length))
            this.props = params || {};
        else
        {
            Object.keys(params).forEach(key => {
                if (this.cols.includes(key))
                    this.props[key] = params[key];
                else
                    throw new Error(key + ' is not a column of ' + this.table);
            });
        }
    }
    select(callback) {
        db.get('SELECT * FROM ? WHERE ? = ?;', this.table, this.idName, this.id, (err, row) => {
            if (row) 
                Object.keys(row).forEach(key => if (key != this.idName) this.props[key] = row[key];
            // TEST THIS
            callback.call(this); 
        });
    }
    selectMany(prop, value, callback)
    {
        function f(err, rows, cur) {
            var result = [];
            if (rows)
                result = rows.map(row => {
                    var id = row[cur.idName];
                    delete row[cur.idName];
                    result.push(new cur.constructor(id, row));
                });
            // FIX THIS
            (callback || prop)(result);
        }
        if (typeof prop == 'string')
            db.all('SELECT * FROM ? WHERE ? = ?;', this.table, this[prop], this.value, (err, rows) => f(err, rows, this));
        else
            db.all('SELECT * FROM ?', this.table, (err, rows) => f(err, rows, this));
        
    }
    insert() {
        var placeholders = '(?' + ', ?'.repeat(this.props.length - 1) + ')';
        db.run('INSERT INTO ? ' + placeholders + ' VALUES ' + placeholders + ';', this._params(true));
    }
    update() {
        var placeholders = '? = ?' + ', ? = ?'.repeat(this.props.length - 1);
        db.run('UPDATE ? SET ' + placeholders + ' WHERE ? = ?;',
            this._params(false).concat([this.idName, this.id]);
    }
    _params(var insert)
    {
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
class User extends DBItem {
    constructor(id, params)
    {
        this.table = 'Users';
        this.cols = ['login', 'password', 'first_name', 'last_name', 'email'];
        super(id, params);
    }
}
class Product extends DBItem {
    constructor(id, params)
    {
        this.table = 'Products';
        this.cols = ['title', 'manufacturer', 'price', 'image', 'description'];
        super(id, params);
    }
    getCategories(callback)
    {
        function f(objs) {
            callback(objs.map(x => x.props.category));
        }
        catobj = new ProdCategory();
        if (this.id)
            catobj.selectMany('prodid', this.id, f);
        else
            catobj.selectMany(f);
    }
}
class Purchase extends DBItem {
    constructor(id, params)
    {
        this.table = 'Purchases';
        this.cols = ['userid', 'prodid'];
        super(id, params);
    }
}
class ProdCategory extends DBItem {
    constructor(id, params)
    {
        this.table = 'Categories';
        this.cols = ['prodid', 'category'];
        super(id, params);
    }
}
function close() {
    db.close();
}