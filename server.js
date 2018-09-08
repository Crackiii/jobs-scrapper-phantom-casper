const express              =    require("express");
const app                  =    express();
const scrap                =    require("./algorithm");
const event = scrap.defEvent;
const ms_connect = scrap.ms_connect;
const server = app.listen(8000, function(){ console.log('Listening on 8000'); });
const io                   =    require("socket.io").listen(server);
const internetAvailable    =    require("internet-available");
app.use(express.static(__dirname + "/"));





app.get("/scrap",function(req,res){
    res.sendFile(__dirname+"/index.html");//Set the Default Route
    io.on("connection",function(socket){ //On Socket Connection
        socketSameMess("Socket",'Sockets Connection Made on ID : <span style="color:#03a9f4;">'+socket.id+'<span>');
        ms_connect.connect(function(err){//On Connection with Database
            if(err) socketSameMess("database_error",err+" "); // If any error in database connection

            socketSameMess("Database ",'Connected to MYSQL Database Successfully...');

            /************************************************************************************************************************************
            ******************************************************** START OR INITIATE SCRAPPING*************************************************
            ************************************************************************************************************************************/
            socket.on("initScrapHit",function(flag){
                if(flag == "START_SCRAPPING"){
                    ms_connect.query('SELECT * FROM companies',function(err,rows,fields){
                        if(err) console.log("Error Executing Query");

                        socketSameMess("Database ",'Sql Query Executed, Data Recieved Successfully !');
                        socketSameMess("Database ",'Total  Websites to Scrap : ' + rows.length);

                        var COMPANIES = rows,
                            COMPANY_DATA,
                            C = 0, //Rows array index
                            NEXT_SITE = false;
                        
                        socket.emit("all_sites",rows);   
                            
                         
                        var scrapWebsite = (function scrapWeb(){
                            internetAvailable().then(function(){
                                socketSameMess("Internet",'Established internet connection !');
                                if(NEXT_SITE){
                                  NEXT_SITE = false;  
                                  C++;
                                  scrapWebsite();
                                } else{
                                    CODES_REF = COMPANIES[C].id;
                                    ms_connect.query("SELECT * FROM companies_codes WHERE `companies_codes`.`comp_fk` ="+CODES_REF,function(err,result){
                                        if(err) console.log(err);

                                        event.emit("hitDefConsole",result);

                                        COMPANY_DATA = result;
                                        var s = new scrap.ScrapData({
                                            info : COMPANIES[C],
                                            data : COMPANY_DATA[0]
                                        });

                                    })
                                }
                            }).catch(function(){
                                socketSameMess("Internet",'There is no Internet Connection  Available!');
                            })
                            return scrapWeb;
                        })();

                        event.on("siteScrapped",function(){
                            NEXT_SITE = true;
                            scrapWebsite();
                        });

                    });
                }
                else if(flag == "PAUSE_SCRAPPING"){
                    event.emit("pauseScrapping",true);
                    event.on("pauseSuccess",function(data){
                        socket.emit("pauseSuccess",data); 
                        socketSameMess("Scrapper ","Paused Info : <span class='bold'>"+ data.time + "</span> and date : <span class='bold'>" +data.dateText + "</span>  with total pages scrapped = <span class='bold'>" + data.page +"</span>");
                        // ms_connect.query("INSERT INTO scrapper_paused_data VALUES () ");
                    });
                }
                else if(flag == "STOP_SCRAPPING"){
                    event.emit("stopScrapping",true);
                }
            }); //initiates Scrapping



            /************************************************************************************************************************************
            ********************************************************ADD NEW COMPANIES TO DATABASE************************************************
            ************************************************************************************************************************************/
            socket.on("initCompanyAdd",function(data){
                var ac = new scrap.AddCompany(data);
                event.on("site-add-error",function(data){
                    socket.emit("site-add-error",data);
                });
            }); // adding a new company
            
            /************************************************************************************************************************************
            ********************************************************GET ALL STATISTICS OF THE SITE***********************************************
            ************************************************************************************************************************************/
            event.on("initCompStats",function(data){
                var ss = new scrap.ScrapperStats();
                event.emit("hitDefConsole",ss.currentStats());
            }); // Retrieving Companies Statistics


            /************************************************************************************************************************************
            ********************************************************SAVE SCRAPER SETTINGS********************************************************
            ************************************************************************************************************************************/
            socket.on("initScrapSettings",function(data){ scrapperSettings(data); }); //Initializing Scrapper Settings

            /************************************************************************************************************************************
            ********************************************************GET ALL STATISTICS OF THE SITE***********************************************
            ************************************************************************************************************************************/
           socket.on("getCompanies", function(){
               ms_connect.query('SELECT * FROM companies',function(err,data,f){
                   if(err) throw err;

                   socket.emit("parseCompanies",data);
               })
           }); // Retrieving Companies 




        }) 

        event.on("hitConsole",function(data){
            socketSameMess(data.a,data.m);
        });
        event.on("hitBar",function(data){
            socket.emit("hitBar",data);
        });
        event.on("hitDefConsole",function(data){
            socket.emit("hitDefConsole",data);
        })
        event.on("UIMetaUpdates",function(data){
            socket.emit("UIMetaUpdates",data);
        });
        event.on("getTotalTime",function(){
           socket.emit("getTotalTime");
           socket.on("showTotalTime",function(data){
             event.emit("showTotalTime",data);
           })
        });
        
        function socketSameMess(auth,mess){
            socket.emit("consoleData",{a:auth,m:mess});
        }

        io.on("disconnect",function(){
            console.log("Client Disconnected !");
            scrap.ms_connect.end();
            socket.removeAllListeners();
        })
    })
})



//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
