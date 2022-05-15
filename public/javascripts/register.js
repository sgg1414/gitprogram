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
 });
 // 点击input 变色
 $(".msg input").focus(function() {
     $(this).css("border", "1px solid #007aff")
     $(this).parent().next().children().css("opacity", "0");
     $(this).parent().parent().next().children().css("opacity", "0");
 });

 // 封装 失去焦点正则测试 函数
 function reg(rule, index) {
     $('input').eq(index).blur(function() {
         if ($(this).val() == '') {
             $(this).css("border", "1px solid #f56c6c");
             $(this).parent().next().children().css("opacity", "1");
             $(this).parent().parent().next().children().css("opacity", "1");
         } else {
             if (rule.test($(this).val())) {
                 $(this).css("border", "1px solid #dcdfe6")
                 $(this).parent().next().children().css("opacity", "0");
                 $(this).parent().parent().next().children().css("opacity", "0");
             } else {
                 $(this).css("border", "1px solid #f56c6c");
                 $(this).parent().next().children().css("opacity", "1");
                 $(this).parent().parent().next().children().css("opacity", "1");
             }
         }
     })
 }
 reg(/[\u4e00-\u9fa5]{2,}/, 1);
 reg(/(13|14|15|18|17)[0-9]{9}/, 2);
 reg(/^\w{6,}$/, 3);
 //  判断是否跳转
 $('.login').click(function() {
     for (i = 0; i < $('.inp').length; i++) {
         let val = $('.msg input')[i].value
         let attr = getCss($('.msg .err .text')[i], 'opacity');
         let chk = $('#chk').prop('checked')
         if (val == '' || attr == 1 || chk == false) {
             return false;
         }
     }
 })


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