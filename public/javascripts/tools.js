/*
功能：判断文件后缀名
参数：url
返回值:boolean值
        ture 表示是一个图片格式
        false 不是一个图片格式
*/
function getStr(url) {
    var res;
    var ex = url.substr(url.lastIndexOf('.') + 1);
    if (ex == 'gif' || ex == 'png' || ex == 'jpg' || ex == 'pneg' || ex == 'jpeg') {
        res = true;
    } else {
        res = false;
    }
    return res;
}


/*
功能:产生随机颜色
参数：null
返回值：随机出来的一个rgb的颜色
*/
function getColor() {
    return "rgb(" + rand(0, 255) + "," + rand(0, 255) + "," + rand(0, 255) + ")";
}


/*
功能：产生随机数
参数：min,max
返回值：在min和max之间的一个随机数
*/
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/*
功能：获取某个元素的内联样式（不存在兼容性问题）
参数： obj,attr
    obj:元素
    attr:属性
返回值：元素obj的内联属性attr
*/
function getCss(obj, attr) {
    if (obj.currentStyle) {
        return obj.currentStyle[attr];
    } else {
        return window.getComputedStyle(obj)[attr];
    }
}


/*
功能：移动元素
参数： obj, attr, step, target
       obj 需要移动的元素
       attr 获取到的元素的css内联属性  top或left  控制元素移动的方向
       step 元素每次移动的间隔值 控制元素移动的速度
       target  元素的目标移动位置
       fun  回调函数
*/
function move(obj, attr, step, target, fun) {
    var num = parseFloat(getCss(obj, attr));
    if (num < target) {
        step = step
    } else {
        step = -step;
    }
    obj.times = setInterval(function() {
        num = num + step;
        obj.style[attr] = num + "px";
        if (num >= target && step > 0) {
            num = target;
        }
        if (num < target && step < 0) {
            num = target;
        }
        if (num == target) {
            clearInterval(obj.times);
            fun && fun();
        }
    }, 10)
}


/*
功能：阻止事件冒泡
参数：null
返回值：null
*/
function stopPro(event) {
    var e = event || window.event;
    if (e && e.stopPropagation) {
        e.stopPropagation();
    } else {
        e.cancelBubble = true
    }
}


/*
功能：添加事件（不存在兼容性问题）
参数：obj,EType,fun
    obj:元素名
    EType:事件名称
    fun:函数名
返回值：null
注：调用的时候 事件名称不加on
*/
function addEvent(obj, EType, fun) {
    if (obj.addEventListener) {
        obj.addEventListener(EType, fun);
    } else if (obj.attachEvent) {
        obj.attachEvent('on' + EType, fun);
    } else {
        obj['on' + EType] = fun;
    }
}



/*
功能：取消事件（不存在兼容性问题）
参数：obj,EType,fun
    obj:元素名
    EType:事件名称
    fun:函数名
返回值：null
注：调用的时候 事件名称不加on
*/
function delEvent(obj, EType, fun) {
    if (obj.removeEventListener) {
        obj.removeEventListener(EType, fun);
    } else if (obj.detachEvent) {
        obj.detachEvent('on' + EType, fun);
    } else {
        obj['on' + EType] = null;
    }
}


/*
功能：get同步方式发送ajax请求
参数：url, parms, success, error
    url:请求的目标文件的路径
    parms:请求的参数
    success:请求成功的回调函数
    error:请求失败的回调函数
返回值：null
注：需要参数时：参数parms的格式为："键1"="值"&"键2"="值"  比如："name"="jack"&"age"=18
    不需要参数时：参数parms为空：""
*/
function getSync(url, parms, success, error) {
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.open('get', url + '?' + parms, false);
    xhr.send();
    if (xhr.readyState == 4 && xhr.status == 200) {
        success(xhr);
    } else {
        error('请求失败');
    }
}

// get异步方式发送ajax请求
function getAsync(url, parms, success, error) {
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.open('get', url + '?' + parms, true);
    xhr.send();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                success(xhr);
            } else {
                error('请求失败');
            }
        }
    }
}

// post同步方式发送ajax请求
function postSync(url, parms, success, error) {
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.open('post', url, false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(parms);

    if (xhr.readyState == 4 && xhr.status == 200) {
        success(xhr);
    } else {
        error('请求失败');
    }
}

// post异步方式发送ajax请求
function postAsync(url, parms, success, error) {
    if (window.XMLHttpRequest) {
        var xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        var xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    xhr.open('post', url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(parms);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                success(xhr);
            } else {
                error('请求失败');
            }
        }
    }
}