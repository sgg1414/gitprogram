    // 轮播
    var mySwiper = new Swiper('.swiper', {
        loop: true, // 首尾相接
        autoplay: {
            delay: 2000,
            disableOnInteraction: false,
        },
        // 分页器
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            bulletActiveClass: 'my-bullet-active',
        },

        // 前进后退按钮
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

    })


    // 右侧导航
    rightLi = document.querySelectorAll(".zixun li");
    rightHui = document.querySelectorAll(".zixun li")[2];
    rightI = document.querySelectorAll(".zixun i");
    rightTxt = document.querySelectorAll(".zixun .txt");
    rightHui.style.display = "none";
    for (let i = 0; i < rightLi.length; i++) {
        rightTxt[i].style.display = "none";
        rightLi[i].onmouseover = function() {
            rightI[i].style.display = "none";
            rightTxt[i].style.display = "block";
        }
        rightLi[i].onmouseout = function() {
            rightI[i].style.display = "block";
            rightTxt[i].style.display = "none";
        }
    }

    var times = null;
    window.onscroll = function() {
        var screenHei = document.documentElement.clientHeight;
        var scrollHei = document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollHei >= screenHei) {
            rightHui.style.display = 'block';
            rightHui.onclick = function() {
                times = setInterval(function() {
                    document.documentElement.scrollTop -= 10;
                    document.body.scrollTop -= 10;
                }, 10)
            }
        } else if (scrollHei < screenHei) {
            rightHui.style.display = 'none';
        }
        if (scrollHei <= 0) {
            clearInterval(times);
            rightHui.style.display = 'none';
        }
    }