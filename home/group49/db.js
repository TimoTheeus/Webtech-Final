var db = new require('sqlite3').Database('data.db');

class DBItem {
    constructor(id, params, allowed) {
        this.table = '';
        this.idName = 'id';
        this.id = id;
        this.props = {};
    }
    select() {
        db.get('SELECT * FROM ? WHERE ? = ?;', this.table, this.idName, this.id, (err, row) =>
            if (row) Object.keys(row).forEach(key => if (key != this.idName) this.props[key] = row[key])
        );
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
        var keys = Object.keys(this.props);
        for (var i = 1; i <= keys.length; i++) {
            var i1, i2;
            if (insert) {
                i1 = i;
                i2 = i + keys.Length;
            } else {
                i1 = 2 * i - 1;
                i2 = i1 + 1;
            }
            params[i1] = keys[i];
            params[i2] = this.props[keys[i]];
        }
        return params;
    }
}
class User extends DBItem {
    constructor(id, login, password, first_name, last_name, email)
    {
        super(id);
        this.table = 'Users'
        
    }
}
function close() {
    db.close();
}