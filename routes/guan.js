const { log } = require("debug/src/browser");
var express = require("express");
const { DEC8_BIN } = require("mysql/lib/protocol/constants/charsets");
var router = express.Router();
var db = require("../public/javascripts/db");
let multer = require("multer");
let fs = require("fs");
let path = require("path");
const { AsyncLocalStorage } = require("async_hooks");
const { render, type, redirect } = require("express/lib/response");

//处理搜索的路由
router.post("/dosou", function (req, res, next) {
    let { sou, type } = req.body;
    if (type == "xuan") {
        db.query(`select * from chose where question like '%${sou}%'`, (data) => {
            if (data.length > 0) {
                res.render("dosou", { data, type: "xuan" });
            } else {
                res.redirect("/guan/nosou");
            }
        });
    } else if (type == "tian") {
        console.log(req.body);
        db.query(`select * from fill where question like '%${sou}%'`, (data) => {
            if (data.length > 0) {
                res.render("dosou", { data, type: "tian" });
            } else {
                res.redirect("/guan/nosou");
            }
        });
    } else if (type == "yong") {
        db.query(`select * from user where name like '%${sou}%'`, (data) => {
            if (data.length > 0) {
                res.render("dosou", { data, type: "yong" });
            } else {
                res.redirect("/guan/nosou");
            }
        });
    }
});
// 没有搜索结果时的路由
router.get("/nosou", function (req, res, next) {
    res.render("nosou");
});

//修改的路由
router.post("/update", function (req, res, next) {
    if (msg) {
        var msg = msg;
    } else {
        var msg = "";
    }
    let { type, id } = req.body;
    db.query(`select * from ${type} where id='${id}'`, (data) => {
        req.session.data = data;
        req.session.cookie.maxAge = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
        res.render("update", { data, msg });
    });
});
// 处理修改的路由
router.post("/doupdate", function (req, res, next) {
    if (req.body.ana) {
        db.query(
            `update chose set section='${req.body.section}',question='${req.body.question}',ana='${req.body.ana}',anb='${req.body.anb}',anc='${req.body.anc}',andd='${req.body.andd}',answer='${req.body.answer}' where id='${req.body.id}'`,
            (data) => {
                res.redirect("/guan");
            }
        );
    } else if (req.body.name) {
        db.query(
            `select * from user where name='${req.body.name}' || phone='${req.body.phone}'`,
            (redate) => {
                if (redate.length > 0) {
                    let data = req.session.data;
                    res.render("update", { data, msg: "已存在" });
                } else {
                    db.query(
                        `update user set name='${req.body.name}',phone='${req.body.phone}',pwd='${req.body.pwd}' where id='${req.body.id}'`,
                        (data) => {
                            res.redirect("/guan");
                        }
                    );
                }
            }
        );
    } else {
        db.query(
            `update fill set section='${req.body.section}',question='${req.body.question}',answer='${req.body.answer}' where id='${req.body.id}'`,
            (data) => {
                res.redirect("/guan");
            }
        );
    }
});
// 处理添加的路由
router.post("/doadd", function (req, res, next) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }

    if (req.body.ana) {
        db.query(
            `insert into chose values(null,'${req.body.question}','${req.body.section}','${req.body.ana}','${req.body.anb}','${req.body.anc}','${req.body.andd}','${req.body.answer}')`,
            (data) => {
                db.query('select * from user where indent="用户"', (udata) => {
                    db.query("select * from chose", (cdata) => {
                        db.query("select * from fill", (fdata) => {
                            res.render("guan", { name, udata, cdata, fdata, msg: "" });
                        });
                    });
                });
            }
        );
    } else if (req.body.name) {
        db.query(
            `select * from user where name='${req.body.name}' || phone='${req.body.phone}'`,
            (data) => {
                if (data.length > 0) {
                    db.query('select * from user where indent="用户"', (udata) => {
                        db.query("select * from chose", (cdata) => {
                            db.query("select * from fill", (fdata) => {
                                res.render("guan", {
                                    name,
                                    udata,
                                    cdata,
                                    fdata,
                                    msg: "添加失败，用户名或密码已存在",
                                });
                            });
                        });
                    });
                } else {
                    db.query(
                        `insert into user values(null,'${req.body.name}','${req.body.phone}','${req.body.pwd}','用户',null,null,null)`,
                        (data) => {
                            db.query('select * from user where indent="用户"', (udata) => {
                                db.query("select * from chose", (cdata) => {
                                    db.query("select * from fill", (fdata) => {
                                        res.render("guan", { name, udata, cdata, fdata, msg: "" });
                                    });
                                });
                            });
                        }
                    );
                }
            }
        );
    } else {
        console.log(req.query);
        db.query(
            `insert into fill values(null,'${req.body.section}','${req.body.question}','${req.body.answer}')`,
            (data) => {
                db.query('select * from user where indent="用户"', (udata) => {
                    db.query("select * from chose", (cdata) => {
                        db.query("select * from fill", (fdata) => {
                            res.render("guan", { name, udata, cdata, fdata, msg: "" });
                        });
                    });
                });
            }
        );
    }
});
// 添加的路由
router.get("/doadd", function (req, res) {
    if (req.session.name) {
        var name = req.session.name;
    } else {
        var name = "";
    }
    db.query('select * from user where indent="用户"', (udata) => {
        db.query("select * from chose", (cdata) => {
            db.query("select * from fill", (fdata) => {
                res.render("guan", { name, udata, cdata, fdata, msg: "" });
            });
        });
    });
});

// 处理删除的路由
router.post("/delete", function (req, res) {
    db.query(`delete from ${req.body.type} where id='${req.body.id}'`, data => {
        if (data.affectedRows) {
            res.redirect('/guan')
        }
    })
});


// 查看错题的路由
router.get("/lookcuo", function (req, res) {
    console.log(req.query);
    let doid = req.query.userid
    db.query(`select * from notebook where uid="${req.query.userid}"`, (cuodata) => {
        if (cuodata.length > 0) {
            let errchose = [];
            let errfill = []
            for (var i = 0; i < cuodata.length; i++) {
                if (cuodata[i].type == "chose") {
                    db.query(`select * from chose where id='${cuodata[i].qid}'`, (cuochose) => {
                        errchose.push(cuochose[0])
                    })
                } else {
                    db.query(`select * from fill where id='${cuodata[i].qid}'`, (cuofill) => {
                        errfill.push(cuofill[0])
                    })
                }
            }
            setTimeout(() => {
                console.log(errchose, errfill, doid);
                res.render("lookcuo", { errchose, errfill, msg: '', doid })
            }, 100)
        } else {
            res.render("lookcuo", { msg: "没有错题库", doid })
        }
    });
});
// 处理删除错题的路由
router.get("/docuodel", function (req, res) {
    if (req.query.ccid) {
        db.query(`delete from notebook where qid='${req.query.ccid}' && type='chose' && uid='${req.query.id}'`, (data) => {
            if (data.affectedRows) {
                res.redirect('/guan')
            }
        })
    } else if (req.query.alldel) {
        db.query(`delete from notebook where uid='${req.query.alldel}'`, (data) => {
            if (data.affectedRows) {
                res.redirect('/guan')
            }
        })
    }
    else {
        db.query(`delete from notebook where qid='${req.query.cfid}' && type='fill' && uid='${req.query.id}'`, (data) => {
            if (data.affectedRows) {
                res.redirect('/guan')
            }
        })
    }
});

// 退出账号的路由
router.get('/quit', function (req, res, next) {
    // 清除session
    req.session.destroy();
    res.redirect('/');
});
module.exports = router;
