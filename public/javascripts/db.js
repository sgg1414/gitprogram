// 封装mysql数据库
// 2. 导入包
let mysql = require('mysql');
// 3. 配置连接数据库的信息
let conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sgg',
    database: 'questionbank'
});
// 4. 连接数据库
conn.connect();
// 4.1 sql语句
// let sql = 'select * from student';
// 5. 操作数据库

let query = (sql, callback) => {
    conn.query(sql, (err, data) => {
        if (err) {
            console.log(err);
            return err;
        }
        callback(data);
    })
}

// 单独封装一个插入数据的操作
// insert into student values(907,'冉祎航','男',2001,'软件工程','河南科技大学')
let insert = (table, datas, callback) => {
    console.log(datas);
    let keys = '';
    let vals = '';
    for (k in datas) {
        keys += k + ',';
        vals += `'${datas[k]}',`;
        // console.log(k);
        // console.log(datas[k]);
    }
    keys = keys.slice(0, -1);
    vals = vals.slice(0, -1);
    let sql = `insert into ${table} ${keys} values(${vals})`;
    console.log(sql);
    // 把拼接好的sql语句放在query中执行
    query(sql, callback);
}

/**
 * 查询的封装
 * table 表名
 * lists 字段
 * where and条件
 * {
 *    id:1,
 *    name:jack
 * }
 * or 条件
 * */
let select = (table, lists, where, or, callback) => {
    let list = lists.length ? lists.join() : '*';
    let whereArr = [];
    // and 拼接
    for (k in where) {
        whereArr.push(`${k}=${where[k]}`);
    }

    // or拼接
    let orArr = [];
    for (k in or) {
        orArr.push(`${k}=${or[k]}`);
    }

    let sql = `select ${list} from ${table} where ${whereArr.join(' and ')} or ${orArr.join(' or ')}`;

    query(sql, callback);
}

/**
 * 删除的封装
 * table 表名
 * datas {id:1,name:'张三'}条件
 * callback 回调函数
 * */
let del = (table, datas, callback) => {
    let arr = ['1=1']; // 当没有datas数据传入的时候，显示1=1这个条件
    for (k in datas) {
        arr.push(`${k}='${datas[k]}'`);
    }
    let sql = `delete from ${table} where ${arr.join(' and ')}`;
    query(sql, callback);
}

/**
 * 修改的封装
 * table 表名
 * sets 修改的字段
 * where 修改的条件
 * callback 回调函数
 * */
let update = (table, sets, where, callback) => {
    let setArr = [];
    let whereArr = ['1=1']; // 当没有datas数据传入的时候，显示1=1这个条件
    // set字段拼接
    for (k in sets) {
        setArr.push(`${k}='${sets[k]}'`);
    }
    // where条件拼接
    for (k in where) {
        whereArr.push(`${k}='${where[k]}'`);
    }

    let sql = `update ${table} set ${setArr.join(' , ')} where ${whereArr.join(' and ')}`;
    query(sql, callback);
}
module.exports = {
    query,
    insert,
    del,
    update,
    select
};

// 6. 关闭数据库
// conn.end();