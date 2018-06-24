var Clock3D = {}
Clock3D.clock_3d = {};

function setStyle(obj, name, value) {
    var arr = ['Webkit', 'Moz', 'ms', 'O'],
        len = arr.length || 0;
    for (var i = 0; i < len; i++) {
        var sname = arr[i] + name.charAt(0).toUpperCase() + name.substring(1);
        obj.style[sname] = value;
    }
    obj.style[name] = value;
}

function getByClass(oParent, sClass) {
    var aEle = oParent.getElementsByTagName('*');
    var re = new RegExp('\\b' + sClass + '\\b', 'i');
    var aResult = [];

    for (var i = 0; i < aEle.length; i++) {
        if (re.test(aEle[i].className)) {
            aResult.push(aEle[i]);
        }
    }

    return aResult;
}

//弹性运动
Clock3D.flex = function(obj, cur, target, fnDo, fnEnd, fs, ms) {
    var MAX_SPEED = 16;

    if (!fs) fs = 6;
    if (!ms) ms = 0.75;
    var now = {};
    var x = 0; //0-100

    if (!obj.__flex_v) obj.__flex_v = 0;

    if (!obj.__last_timer) obj.__last_timer = 0;
    var t = new Date().getTime();
    if (t - obj.__last_timer > 20) {
        fnMove();
        obj.__last_timer = t;
    }

    clearInterval(obj.timer);
    obj.timer = setInterval(fnMove, 20);

    function fnMove() {
        obj.__flex_v += (100 - x) / fs;
        obj.__flex_v *= ms;

        if (Math.abs(obj.__flex_v) > MAX_SPEED) obj.__flex_v = obj.__flex_v > 0 ? MAX_SPEED : -MAX_SPEED;

        x += obj.__flex_v;

        for (var i in cur) {
            now[i] = (target[i] - cur[i]) * x / 100 + cur[i];
        }


        if (fnDo) fnDo.call(obj, now);

        if (Math.abs(obj.__flex_v) < 1 && Math.abs(100 - x) < 1) {
            clearInterval(obj.timer);
            if (fnEnd) fnEnd.call(obj, target);
            obj.__flex_v = 0;
        }
    }
};

(function() {
    var flex = Clock3D.flex;

    Clock3D.clock_3d.create = function(elementId) {
        var oDiv = document.getElementById(elementId);

        Clock3D.clock_3d._create_ele(oDiv);

        var aUl = oDiv.getElementsByTagName('ul');
        var oContainer = getByClass(oDiv, 'container')[0];
        var now = '000000';
        var rx = 0,
            ry = 0;
        var MAX_R = 12;

        var paused = false;

        var finish = 0;

        var start = function() {
            var i = 0;

            var tt = setInterval(function() {
                flex(aUl[i], { scale: 0 }, { scale: 1 }, function(now) {
                    setStyle(this, 'transform', 'rotateX(0deg) scale(' + now.scale + ')');
                }, function() {
                    setStyle(this, 'transform', 'rotateX(0deg)');
                    if (++finish == aUl.length) {
                        finished();
                    }
                });

                i++;

                if (i == aUl.length)
                    clearInterval(tt);
            }, 70);

            function finished() {
                function next() {
                    var oDate = new Date();

                    function d(n) { return n < 10 ? '0' + n : '' + n; }
                    oDate.setSeconds(oDate.getSeconds() - 1);
                    var str0 = d(oDate.getHours()) + d(oDate.getMinutes()) + d(oDate.getSeconds());
                    oDate.setSeconds(oDate.getSeconds() + 1);
                    var str1 = d(oDate.getHours()) + d(oDate.getMinutes()) + d(oDate.getSeconds());
                    oDate.setSeconds(oDate.getSeconds() + 1);
                    var str2 = d(oDate.getHours()) + d(oDate.getMinutes()) + d(oDate.getSeconds());
                    oDate.setSeconds(oDate.getSeconds() + 1);
                    var str3 = d(oDate.getHours()) + d(oDate.getMinutes()) + d(oDate.getSeconds());

                    for (var i = 0; i < now.length; i++) {
                        if (now.charAt(i) != str1.charAt(i)) {
                            move(aUl[i], str1.charAt(i), str2.charAt(i), str0.charAt(i), str3.charAt(i));
                        }
                    }

                    now = str1;

                    function move(oUl, nu, nb, np, nf) {
                        var su = getByClass(oUl, 'clock_3d_top')[0].getElementsByTagName('span')[0];
                        var sb = getByClass(oUl, 'clock_3d_bottom')[0].getElementsByTagName('span')[0];
                        var sf = getByClass(oUl, 'clock_3d_front')[0].getElementsByTagName('span')[0];
                        var sb2 = getByClass(oUl, 'clock_3d_back')[0].getElementsByTagName('span')[0];

                        su.innerHTML = nu;
                        sb2.innerHTML = nb;

                        flex(oUl, { rotateX: 0 }, { rotateX: -90 }, function(now) {
                            setStyle(this, 'transform', 'rotateX(' + now.rotateX + 'deg)');
                        }, function() {
                            setStyle(this, 'transform', 'rotateX(0deg)');

                            var tmp = sb.innerHTML;
                            sb.innerHTML = np;
                            sb2.innerHTML = nf;
                            su.innerHTML = nb;
                            sf.innerHTML = nu;
                        });
                    }
                }

                setInterval(function() {
                    if (paused) return;
                    next();
                }, 1000);

                //拖拽部分
                oDiv.onmousedown = function(ev) {
                    clearInterval(oContainer.timer);
                    clearInterval(timerAuto);

                    var oEvent = ev || event;
                    var sx = oEvent.clientX;
                    var sy = oEvent.clientY;
                    var srx = rx;
                    var sry = ry;

                    document.onmousemove = function(ev) {
                        var oEvent = ev || event;

                        rx = srx + (oEvent.clientX - sx) / 20;
                        ry = sry + (oEvent.clientY - sy) / 20;

                        setStyle(oContainer, 'transform', 'rotateX(' + -ry + 'deg) rotateY(' + rx + 'deg)');
                    };

                    document.onmouseup = function() {
                        document.onmousemove = null;
                        document.onmouseup = null;

                        var nx, ny;

                        if (rx < -MAX_R)
                            nx = -MAX_R;
                        else if (rx > MAX_R)
                            nx = MAX_R;
                        else
                            nx = rx;

                        if (ry < -MAX_R)
                            ny = -MAX_R;
                        else if (ry > MAX_R)
                            ny = MAX_R;
                        else
                            ny = ry;

                        flex(oContainer, { rx: rx, ry: ry }, { rx: nx, ry: ny }, function(now) {
                            rx = now.rx;
                            ry = now.ry;
                            setStyle(this, 'transform', 'rotateX(' + -ry + 'deg) rotateY(' + rx + 'deg)');
                        }, function() {
                            timerAuto = setInterval(autoRotate, 30);
                        });
                    };

                    return false;
                };

                //自动转动
                function rnd(n, m, min) {
                    var r = 0;

                    while (1) {
                        r = Math.random() * Math.abs(m - n) + Math.min(n, m);
                        if (Math.abs(r) >= Math.abs(min)) {
                            return r;
                        }
                    }
                }

                var S_INIT = 0.14;
                var S_INIT_MIN = 0.03;
                var vx = rnd(-S_INIT, S_INIT, S_INIT_MIN);
                var vy = rnd(-S_INIT, S_INIT, S_INIT_MIN);

                function autoRotate() {
                    rx += vx;
                    ry += vy;

                    if (rx <= -MAX_R) {
                        rx = -MAX_R;
                        vx = rnd(0, S_INIT, S_INIT_MIN);
                    } else if (rx >= MAX_R) {
                        rx = MAX_R;
                        vx = rnd(-S_INIT, 0, S_INIT_MIN);
                    }

                    if (ry <= -MAX_R) {
                        ry = -MAX_R;
                        vy = rnd(0, S_INIT, S_INIT_MIN);
                    } else if (ry >= MAX_R) {
                        ry = MAX_R;
                        vy = rnd(-S_INIT, 0, S_INIT_MIN);
                    }

                    setStyle(oContainer, 'transform', 'rotateX(' + -ry + 'deg) rotateY(' + rx + 'deg)');
                }
                var timerAuto = setInterval(autoRotate, 30);
            }
        }

        //页面滚动，看看是否滚到了时钟这里
        function fnEnter() {
            if (start) {
                start();
                start = null;
            } else paused = false;
        }

        function fnLeave() {
            paused = true;
        }

        function fnScroll() {
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            scrollTop += document.documentElement.clientHeight;

            if (scrollTop >= oDiv.offsetTop) fnEnter();
            else fnLeave();
        }
        fnEnter();
        // bindEvent(window, 'scroll', fnScroll);
        // bindEvent(window, 'resize', fnScroll);
    };

    Clock3D.clock_3d._create_ele = function(oDiv) {
        var arr = [];

        arr.push('<div class="container">');
        for (var i = 1; i <= 8; i++) {
            if (i % 3 == 0)
                arr.push('<span class="split"></span>');
            else
                arr.push(
                    '<div class="num_container">' +
                    '<ul>' +
                    '<li class="clock_3d_front"><span>0</span></li>' +
                    '<li class="clock_3d_back"><span>0</span></li>' +
                    '<li class="clock_3d_top"><span>0</span></li>' +
                    '<li class="clock_3d_bottom"><span>0</span></li>' +
                    '</ul>' +
                    '</div>');
        }
        arr.push('</div>');

        oDiv.innerHTML = arr.join('');
    };
})();