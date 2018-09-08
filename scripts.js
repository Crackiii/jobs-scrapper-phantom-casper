var app = angular.module("myApp",[]);
app.controller("myCtrl",function($scope){

    //Socket Programming...
    var socket = io('http://localhost:8000', {
        transports: ['websocket'], 
        upgrade: false
    });

    socket.on('connect',function(){
        if(socket.connected){
            socket.on("consoleData",function(data){
                $(".log-container ul").append("<li><b>"+
                                                        data.a.replace(/(socket)/gi,"<span class='bold' style='color:#4CAF50'>Socket</span>")
                                                        .replace(/(database )/gi,"<span class='bold' style='color:#de880a'>Database</span>")
                                                        .replace(/(database_error)/gi,"<span class='bold' style='color:#ff3535'>Database Error</span>")
                                                        .replace(/(scrapper )/gi,"<span class='bold' style='color:#001bb0'>Scrapper</span>")
                                                        .replace(/(init)/gi,"<span class='bold' style='color:#001bb0'>Scrapper</span>")
                                                        .replace(/(scrapper_error)/gi,"<span class='bold' style='color:#ff3535'>Scrapper Error</span>")
                                                        .replace(/(internet)/gi,"<span class='bold' style='color:#9c27b0'>Internet</span>")
                                                    +"</b> : "+ data.m +" </li>");
                $(".log-container").scrollTop($(".log-container ul").height());
            //    socket.off("consoleData");
            });

            socket.on("hitBar",function(data){
                $(".scrapping-bar .sb-text").text(data+"%");
                $(".scrapping-bar .sb-fill").css({width:data+"%"});
            });

            socket.on("hitDefConsole",function(data){
                console.log(data);
            })

            socket.on("UIMetaUpdates",function(data){
                $(".scrapping-site span").text(data.website);
                $(".scrapping-meta .meta1").text(data.page);
                $(".scrapping-meta .meta2").text(data.job);
            });

            socket.on("getTotalTime",function(){
                socket.emit("showTotalTime",$(".scrapping-timer span").text());
            });

            $(".tc-btns a").on("click",function(){
                var i = $(this).index();
                $(".tc-tabs-wrap .tc-tab").each(function(){
                    $(this).hide();
                }).eq(i).show();
            
                $(".tc-btns a").each(function(){
                    $(this).removeClass("tc-active");
                }).eq(i).addClass("tc-active");
            })
            
            
            $(".add-site-submit button").on("click",function(){
                $(".modal-bg").css({display:"flex"});
                $("#as-mod-cancel").on("click",function(){
                    $(".modal-bg").hide();
                })
                //Ad website submit function start
                $(document).on("submit","#add-site-form",function(e){
                    e.preventDefault();
                    let t = e.target;
                    socket.emit("initCompanyAdd",$(t).serializeArray());
                    $(".modal-bg").hide();
                    socket.on("site-add-error",function(data){
                        $(".add-site-error").text(data);
                    })
                    // $(this).trigger("reset");
                })
            })
        
        
            
            $("#init-scrap").on("click",function(){
                $("#init-scrap").attr('disabled','disabled').text("Please wait, this may take few seconds !");
        
                var h= "00", m="00", s="00", ms = "00";
                function add(){
                    s++;
                    s = (s < 10) ? "0"+s : s;   
                    if(s >= 60){
                        s = 00;
                        m++;
                        m = (m < 10) ? "0"+m : m;
                        if(m >= 60){
                            m = 00;
                            h++;
                            h = (h < 10) ? "0"+h : h;
                        }
                    }
                    $(".scrapping-timer span").text(h+" : "+m+" : "+s);
                }
        
                (function timer(){
                    setInterval(add,1000);
                })()
        
                socket.emit("initScrapHit","START_SCRAPPING");

                socket.on("consoleData",function(data){
        
                    if(data.a.toLowerCase() == "init"){
        
                        $("#init-scrap").removeAttr('disabled').html("<i class=\"fas fa-bolt\"></i> Start Scrapping the Sites");
                        $("#init-scrap").parent().hide();
                        $(".scrapping-bar").show();
                        $(".after-start").css({display:"flex"});
                        $(".lc-current-state").show().children().eq(0).text("Scrappig !");
                    
                        $(".after-start button").each(function(){
                            $(this).removeAttr('disabled');
                        });
                        $(".after-start button").eq(0).attr('disabled','disabled').click(diableIt);
                    
                        $(".after-start button").eq(1).click(function(){
                            $(".lc-warning").css({display:"flex"});
                            $("#lc-war-cancel").on("click",function(){
                                $(".lc-warning").hide();
                            })
                            $("#lc-war-confirm").on("click",function(){
                                socket.emit("initScrapHit","STOP_SCRAPPING");
                                $(".lc-warning").hide();
                                $(".after-start").hide();
                                $(".lc-current-state").hide();
                                $(".scrapping-bar").hide();
                                $("#init-scrap").parent().css({display:"flex"});
                            })
                        })
                    
                        
                        $(".after-start button").eq(2).click(diableIt);
                    
                        function diableIt(e){
                            if(e.currentTarget.id == "pause-scrap"){
                                socket.emit("initScrapHit","PAUSE_SCRAPPING");
                                socket.on("pauseSuccess",function(data){
                                    console.log(data);
                                });
                                $(".lc-current-state span").text(" Scrappig Paused !");
                            } else if(e.currentTarget.id == "play-scrap"){
                                $(".lc-current-state span").text(" Scrappig !");
                            }
                            $(".after-start button").each(function(){
                                $(this).removeAttr('disabled');
                            })
                            $(this).attr('disabled','disabled');
                        }
                    }
                })
            
            })//Init Scrap End
        
            //Get COmpanies
            $(".ts-links-update button").on("click",function(){
                socket.emit("getCompanies");
                socket.on("parseCompanies",function(data){
                    $scope.dataa = data;
                });
            })

            //Get Companies Statistics



        }
    })    

})


    




















