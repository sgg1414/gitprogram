const { log } = require("debug/src/browser");
var express = require("express");
const { DEC8_BIN } = require("mysql/lib/protocol/constants/charsets");
var router = express.Router();
var db = require("../public/javascripts/db");
let multer = require("multer");
let fs = require("fs");
let path = require("path");
const { AsyncLocalStorage } = require("async_hooks");
const { redirect } = require("express/lib/response");

/* GET home page. */
// 主页的路由
router.get("/", function (req, res) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    res.render("index", { name: name });
});
// 登录的路由
router.get("/login", function (req, res) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    res.render("login", { msg: "", name: name });
});
// 注册的路由
router.get("/register", function (req, res, next) {
    if (req.session.name) {
        var uname = req.session.name;
    } else {
        var uname = "";
    }

    res.render("register", { uname, flag: 0 });
});
// 章节练习的路由
router.get("/section", function (req, res) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    res.render("section", { name: name });
});

// 处理注册后的路由
router.post("/doreg", function (req, res, next) {
    if (req.session.name) {
        var uname = req.session.name;
    } else {
        var uname = "";
    }
    let { name, phone, pwd } = req.body;

    db.query(`select * from user where name='${name}' `, (data) => {
        // 判断昵称是否存在
        if (data.length > 0) {
            res.render("register", { flag: 1, uname });
        } else {
            db.query(`select * from user where phone='${phone}' `, (data) => {
                // 判断电话号码是否存在
                if (data.length > 0) {
                    res.render("register", { flag: 2, uname });
                } else {
                    db.query(
                        `insert into user values(null,'${name}','${phone}','${pwd}','用户',null,null,null)`,
                        (data) => {
                            if (data.affectedRows > 0) {
                                res.redirect("/login");
                            }
                        }
                    );
                }
            });
        }
    });
});
// 处理登录后的路由
router.post("/dolog", function (req, res) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    let { phone, pwd, indent } = req.body;
    db.query(
        `select name from user where phone='${phone}' && pwd='${pwd}' && indent='${indent}'`,
        (data) => {
            if (data.length > 0) {
                if (indent == "用户") {
                    req.session.name = data[0].name;
                    req.session.cookie.maxAge =
                        new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
                    res.redirect("/");
                } else if (indent == "管理员") {
                    req.session.name = data[0].name;
                    req.session.cookie.maxAge =
                        new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
                    res.redirect("/guan");
                }
            } else {
                res.render("login", { msg: "账号不存在", name });
            }
        }
    );
});
// 管理员首页
router.get("/guan", function (req, res) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    db.query('select * from user where indent="用户"', (udata) => {
        db.query("select * from chose", (cdata) => {
            db.query("select * from fill", (fdata) => {
                db.query("select * from notebook", (cuot) => {
                    db.query("select * from score", (score) => {
                        res.render("guan", {
                            name,
                            udata,
                            cdata,
                            fdata,
                            msg: "",
                            cuot,
                            score,
                        });
                    });
                });
            });
        });
    });
});
//章节答题的路由
router.get("/work", function (req, res) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    var title = [
        "第1章 绪论",
        "第2章 线性表",
        "第3章 栈和队列",
        "第4章 串",
        "第5章 数组和广义表",
        "第6章 二叉树",
        "第7章 图",
        "第8章 动态存储管理",
        "第9章 查找",
        "第10章 内部排序",
        "第11章 外部排序",
        "第12章 文件",
    ];
    db.query(`select * from chose where section='${req.query.sc}'`, (data) => {
        db.query(`select * from fill where section='${req.query.sc}'`, (data1) => {
            let i = Number(req.query.sc) - 1;
            res.render("work", { name: name, data, data1, title: title[i] });
        });
    });
});

//章节练习 提交到错题库的路由
router.post("/dowork", function (req, res) {
    db.query(`select id from user where name='${req.session.name}'`, (uname) => {
        let num = 0;
        let num1 = 0;
        if (req.body.cuo) {
            for (i = 0; i < req.body.cuo.split(",").length; i++) {
                db.query(
                    `insert into notebook values(null,'${uname[0].id}','${req.body.cuo.split(",")[i]
                    }','chose')`,
                    (data) => {
                        if (data.affectedRows > 0) {
                            num++;
                        }
                    }
                );
            }
            if (req.body.fcuo) {
                for (i = 0; i < req.body.fcuo.split(",").length; i++) {
                    db.query(
                        `insert into notebook values(null,'${uname[0].id}','${req.body.fcuo.split(",")[i]
                        }','fill')`,
                        (data) => {
                            if (data.affectedRows > 0) {
                                num1++;
                            }
                            if (
                                num >= req.body.cuo.split(",").length &&
                                num1 >= req.body.fcuo.split(",").length
                            ) {
                                res.redirect("/section");
                            }
                        }
                    );
                }
            } else {
                console.log("123");
            }
        } else {
            console.log("123");
        }
    });
});
// 错题库的路由
router.get("/mybank", function (req, res) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    if (req.query.type) {
        var type = req.query.type;
    } else {
        var type = "chose";
    }
    db.query(`select id from user where name='${req.session.name}'`, (uid) => {
        db.query(`select qid from notebook where uid='${uid[0].id}'`, (isyou) => {
            if (isyou.length) {
                if (type) {
                    db.query(
                        `select qid from notebook where uid='${uid[0].id}' && type='${type}'`,
                        (queid) => {
                            let dataArr = [];
                            if (queid.length > 0) {
                                for (i = 0; i < queid.length; i++) {
                                    db.query(
                                        `select * from ${type} where id=${queid[i].qid}`,
                                        (data) => {
                                            dataArr.push(data[0]);
                                            if (dataArr.length >= queid.length) {
                                                res.render("mybank", { name, dataArr, type });
                                            }
                                        }
                                    );
                                }
                            } else {
                                res.render("mybank", { name, dataArr, type });
                            }
                        }
                    );
                } else {
                    res.send("456");
                }
            } else {
                res.render("nobank");
            }
        });
    });
});

// 题型练习的路由
router.get("/ttype", function (req, res, next) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }

    if (req.query.type) {
        var type = req.query.type;
    } else {
        var type = "chose";
    }

    if (type == "chose") {
        db.query(`select * from chose`, (data) => {
            res.render("ttype", { name: name, type, data });
        });
    } else if (type == "fill") {
        db.query(`select * from fill`, (data) => {
            res.render("ttype", { name: name, type, data });
        });
    } else {
        res.send("服务器连接失败！");
    }
});

// 处理 题型练习 提交错题的 路由
router.post("/dottype", function (req, res, next) {
    db.query(`select id from user where name='${req.session.name}'`, (uname) => {
        if (req.body.cuo) {
            let num = 0;
            for (i = 0; i < req.body.cuo.split(",").length; i++) {
                db.query(
                    `insert into notebook values(null,'${uname[0].id}','${req.body.cuo.split(",")[i]
                    }','chose')`,
                    (data) => {
                        if (data.affectedRows > 0) {
                            num++;
                        }
                        if (num >= req.body.cuo.split(",").length) {
                            res.redirect("/ttype");
                        }
                    }
                );
            }
        } else {
            console.log(123);
        }
        if (req.body.fcuo) {
            let num = 0;
            for (i = 0; i < req.body.fcuo.split(",").length; i++) {
                db.query(
                    `insert into notebook values(null,'${uname[0].id}','${req.body.fcuo.split(",")[i]
                    }','fill')`,
                    (data) => {
                        if (data.affectedRows > 0) {
                            num++;
                        }
                        if (num >= req.body.fcuo.split(",").length) {
                            res.redirect("/ttype");
                        }
                    }
                );
            }
        } else {
            console.log("123");
        }
    });
});

// 我的 的路由
router.get("/mine", function (req, res, next) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    db.query(`select * from user where name='${name}'`, (data) => {
        if (data.length > 0) {
            res.render("mine", { name, data });
        } else {
            res.send("服务器连接失败");
        }
    });
});
// 完善个人信息的路由
router.get("/domine", function (req, res, next) {
    if (req.session.name) {
        var uname = req.session.name;
    } else {
        var uname = "";
    }
    if (msg) {
        var msg = "";
    }
    res.render("domine", { uname, msg });
});

// 闯关模式的路由
router.get("/chuang", function (req, res, next) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    db.query(`select * from score order by score desc limit 10`, (data) => {
        res.render("chuang", { name, scoreData: data });
    });
});

// 闯关开始答题的路由
router.get("/workchuang", function (req, res, next) {
    var guan;
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    if (!req.query.guan) {
        guan = 1;
    } else {
        guan = Number(Number(req.query.guan) + 1);
    }
    db.query(`select id from chose`, (ids) => {
        let randid = Math.floor(Math.random() * ids.length) + 1;
        db.query(`select * from chose where id='${randid}'`, (data) => {
            res.render("workchuang", { name, data, guan });

            let newscore = req.query.guan;
            if (newscore) {
                db.query(`select id from user where name='${name}'`, (uid) => {
                    db.query(
                        `select score from score where uid=${uid[0].id}`,
                        (oldscore) => {
                            if (oldscore.length > 0 && oldscore[0].score < Number(newscore)) {
                                db.query(
                                    `update score set score='${newscore}' where uid='${uid[0].id}'`,
                                    (data) => {
                                        if (data.affectedRows > 0) {
                                            console.log("有进步！");
                                        }
                                    }
                                );
                            } else if (oldscore.length == 0) {
                                db.query(
                                    `insert into score values (null,${uid[0].id},${newscore},'${name}')`,
                                    (data) => {
                                        if (data.affectedRows > 0) {
                                            console.log("第一次做啊？");
                                        }
                                    }
                                );
                            } else {
                                console.log("还没之前闯的远！");
                            }
                        }
                    );
                });
            }
        });
    });
});

// 上传信息的路由
// 设置文件上传位置
let uploader = multer({
    dest: path.join(__dirname, "../", "public", "avatars"),
});
// 处理上传操作 上传一个文件
router.post("/setmine", uploader.single("files"), function (req, res, next) {
    if (req.session.name) {
        var uname = req.session.name;
    } else {
        var uname = "";
    }
    let { file } = req;
    let { name, sex, brief } = req.body;
    // 获取后缀名
    let extname = path.extname(file.originalname);
    // 获取文件名
    let filepath = file.path;
    // 拼接完整的路径 + 后缀名
    let fileName = filepath + extname;
    // 对上传到imgs的文件进行重命名fs.rename(oldname,newname,callback)
    fs.rename(filepath, fileName, (err) => {
        if (!err) {
            let imgDate = "avatars/" + path.basename(fileName);
            // 保存数据库
            db.query(`select * from user where name='${name}'`, (rename) => {
                if (rename.length > 0 && rename[0].name != uname) {
                    res.render("domine", { msg: "昵称已存在", uname });
                } else {
                    db.query(
                        `update user set name='${name}',sex='${sex}',brief='${brief}',avatar='${imgDate}' where name='${uname}'`,
                        (imgres) => {
                            if (imgres.affectedRows > 0) {
                                db.query(`select * from user where name='${name}'`, (data) => {
                                    res.render("mine", { data, name });
                                });
                            }
                        }
                    );
                }
            });
        } else {
            res.send("上传失败");
        }
    });
});

// 退出账号的路由
router.get("/quit", function (req, res, next) {
    // 清除session
    req.session.destroy();
    res.redirect("/");
});
module.exports = router;
