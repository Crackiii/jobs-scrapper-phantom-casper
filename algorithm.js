const phantom              =    require('phantom');
const ev                   =    require('events');
const defEvent             =    new ev.EventEmitter();
const mysql                =    require("mysql");
const ms_connect           =    mysql.createConnection({
                                    host:'localhost',
                                    user:'root',
                                    password:'',
                                    database:'scrapper_db'
                                });


var MAIN_URL,
    TOTAL_PAGES,
    TOTAL_JOBS,
    ALL_PAGES_JOBS_DATA = [],
    PAGE_DATA_COUNTER = 0,
    PAGE_COUNTER = 0, 
    PAGE_JOBS_DETAILS = [],
    IND_JOB_DETAILS = [],
    JOB_NUMBER = 1,
    PAGE_NUMBER = 1,
    CURRENT_PAGE = 0,
    CURRENT_JOB = 0,
    SNAPS_COUNTER  = 1,
    PAGE_WAIT_TIME,
    CLICK_NEXT_TIME,  
    CURRENT_WEBSITE,
    CURR_WEBSITE_NAME = null,
    CURR_WEBSITE_INDEX = 1,
    PH_INSTANCE,
    PH_PAGE,
    TERMINATE_FUNCTION = {},
    //SCRAPPING DETAILS
    LAST_SCRAPPED_TIME,
    LAST_SCRAPPED_DATE,
    LAST_NEW_JOBS_FOUND = 0,
    LAST_TOTAL_TIME_TAKEN,
    REFERENCE_KEY,
    //BUTTON LOADING VRIABLES
    CURRENT_LOADED_JOBS = 0;

    

/*
****************************************************************************************************************
****************************************************************************************************************
                                                SCRAPPER CODE
****************************************************************************************************************
****************************************************************************************************************
*/


function InitScrap(){
          
    // Initiate the variables and data   
    this.init = async function(url){

       if(!scrapperTermination()){
            MAIN_URL = url;
            TOTAL_PAGES = 0,
            TOTAL_JOBS = 0,
            ALL_PAGES_JOBS_DATA = [],
            PAGE_DATA_COUNTER = 0,
            PAGE_COUNTER = 0, 
            PAGE_JOBS_DETAILS = [],
            IND_JOB_DETAILS = [],
            JOB_NUMBER = 1,
            PAGE_NUMBER = 1,
            CURRENT_PAGE = 0,
            CURRENT_JOB = 0,
            SNAPS_COUNTER  = 1,
            PAGE_WAIT_TIME,
            CLICK_NEXT_TIME,  
            CURRENT_WEBSITE,
            CURR_WEBSITE_NAME = null,
            CURR_WEBSITE_INDEX = 1,
            PH_INSTANCE,
            PH_PAGE,
            TERMINATE_FUNCTION = {},
            //SCRAPPING DETAILS
            LAST_SCRAPPED_TIME = 0,
            LAST_SCRAPPED_DATE = 0,
            LAST_NEW_JOBS_FOUND = 0,
            LAST_TOTAL_TIME_TAKEN = 0,
            REFERENCE_KEY = 0,
            //BUTTON LOADING VRIABLES
            CURRENT_LOADED_JOBS = 0
            PH_INSTANCE = await phantom.create(),
            PH_PAGE = await PH_INSTANCE.createPage();

            eventSameMess("Init",'Scrapper Initiated, Please wait while we load the URL...');

            return {data:null,success:true};

       } else{
           return scrapperTermination();
       }

    }      
    
    // Load the Basic Page First      
    this.loadPage  = async function(pageLoadWait,jobsMetaCode,pagesMetaCode){ 

        if(!scrapperTermination()){

            var status = await PH_PAGE.open(MAIN_URL);
             
            if(status == "success"){
                eventSameMess("Scrapper ","The Page <a href="+MAIN_URL+" target='_blank' style='color:#03a9f4;'>"+MAIN_URL+" </a> loaded Successfully !");
                if(pageLoadWait !== undefined && pageLoadWait !== null && pageLoadWait !== false){
                    let p = new Promise(function(res,rej){
                        setTimeout(async function(){
                            TOTAL_PAGES = await PH_PAGE.evaluate(function(JJ){ 
                                var fn = new Function('return '+JJ);
                                return fn();
                            },jobsMetaCode);
                            TOTAL_JOBS = await PH_PAGE.evaluate(function(PP){
                                var fn = new Function('return '+PP);
                                return fn();
                            },pagesMetaCode);
                            PH_PAGE.render("shots/Snap "+( SNAPS_COUNTER++ )+".png");
                            if(TOTAL_PAGES !== null && TOTAL_JOBS !== null){
                                PH_PAGE.render("shots/Snap "+( SNAPS_COUNTER++ )+".png");
                                eventSameMess("Scrapper ",'The Page SNAPSHOP has been taken !');
                            }
                            res({data:{p:TOTAL_PAGES,j:TOTAL_JOBS},success:true});
                        },pageLoadWait);
                    })
                    if(!scrapperTermination()){
                        return await p;
                    } else{
                        return scrapperTermination();
                    }
                }
            }
        } else{
            return scrapperTermination();
        }

    }    
    
    //Get the current Page Job Details
    this.evaluatePage = async function(pageJobsCode){
        if(!scrapperTermination()){
            eventSameMess("Scrapper ",'The Page Current Jobs are evaluating ...');
            PAGE_JOBS_DETAILS = await PH_PAGE.evaluate(function(pjcode){
                var fn = new Function(pjcode);
                return fn();
            },pageJobsCode)
            // defEvent.emit("hitDefConsole",PAGE_JOBS_DETAILS);
            if(!scrapperTermination()){
                return {data:PAGE_JOBS_DETAILS,success:true};
            } else{
                return scrapperTermination();
            }
        } else{
            return scrapperTermination();
        }
    }
    
    //Get Current Jobs Details
    this.evaluateJobsDetails = async function(job_url, jobsDetailsCode){
        if(!scrapperTermination()){
            eventSameMess("Scrapper ",'The Page Current Job Details are evaluating ...');
            var status = await PH_PAGE.open(job_url);
            if(status == "success"){
                eventSameMess("Scrapper ", "Job # <span class='bold'>"+JOB_NUMBER+"</span> on Page # <span class='bold'>"+PAGE_NUMBER+"</span> details opened successfully !");
                IND_JOB_DETAILS = await PH_PAGE.evaluate(function(jdcode){
                    var fn = new Function(jdcode);
                    return fn();
                },jobsDetailsCode)
                // defEvent.emit("hitDefConsole",IND_JOB_DETAILS);
                if(!scrapperTermination()){
                    return {data:IND_JOB_DETAILS,success:true};
                } else{
                    return scrapperTermination();
                }
            }
        } else{
            return scrapperTermination();
        }
    }

    this.clickNext = async function(btnClickCode){

        if(!scrapperTermination()){

            await PH_PAGE.evaluate(function(bcc){
                var fn = new Function("return"+bcc);
                return fn();
            },btnClickCode);

            let p = new Promise(function(res,rej){
                eventSameMess("Scrapper ",'Next Page Click, Please wait ...');
                setTimeout(async function(){
                    PH_PAGE.render("shots/Snap "+( SNAPS_COUNTER++ )+".png");
                    eventSameMess("Scrapper ",'Next Page is Loaded successfully , and snapshot has been taken !');
                    res({data:null,success:true});
                },5000);
            })

            if(!scrapperTermination()){
                return await p;
            } else{
                return scrapperTermination();
            }

        } else{
            return scrapperTermination();
        }

    }

    this.btnClick = async function(btnLoadCode){
        if(!scrapperTermination()){
            await PH_PAGE.evaluate(function(btnLoadCode){
                var fn = new Function(btnLoadCode);
                return fn();
            },btnLoadCode);
            CURRENT_LOADED_JOBS = await PH_PAGE.evaluate(function(currentLoadedJobs){
                var fn = new Function("return"+currentLoadedJobs);
                return fn();
            },currentLoadedJobs);
            let p = new Promise(function(res,rej){
                setTimeout(async function(){
                    PH_PAGE.render("shots/Snap "+( SNAPS_COUNTER++ )+".png");
                    eventSameMess("Scrapper ",'More jobs Loaded , and snapshot has been taken !');
                    res({data:CURRENT_LOADED_JOBS,success:true});
                },5000);
            })
            if(!scrapperTermination()){
                return await p;
            } else{
                return scrapperTermination();
            }
        } else{
            return scrapperTermination();
        }
    }

    this.updatePages = async function(){
        if(TERMINATE_FUNCTION.on) { 
            if(TERMINATE_FUNCTION.flag == "STOP"){
                return {data:"SCRAPPER_STOPPED",success:false};
            } else if(TERMINATE_FUNCTION.flag == "PAUSE"){
                return {data:"SCRAPPER_PAUSED",success:false};
            }
         }
        TOTAL_PAGES = await PH_PAGE.evaluate(function(){
           
        })
    }
}      

function ScrapData(opts){
    
    var scrap = new InitScrap(), _this = this, CURR_WEBSITE_INDEX = opts.info.id;

    
    scrap.init(opts.info.url).then(function(init_res){
        if(init_res.success){
            _this.loadPageRet();
        } else {
           scrapperTerminationFlag(init_res.data);
           return;
        }
    });

    this.loadPageRet = function(){
        scrap.loadPage(opts.data.site_load_wait,opts.data.jobs_meta_code,opts.data.pages_meta_code).then(function(load_res){
            if(load_res.success){ 
                if(load_res.data.p !== null && load_res.data.j !== null){
                    TOTAL_PAGES =  load_res.data.p;
                    TOTAL_JOBS  =  load_res.data.j;
                    eventSameMess("Scrapper ",'Total jobs Found on this site : <span class="bold">'+ TOTAL_JOBS+'</span> and Total Pages :  <span class="bold">'+ TOTAL_PAGES+'</span>');
                    _this.evaluatePageRet();
                } else{
                    _this.loadPageRet();
                    PAGE_WAIT_TIME += opts.pageLoadWait;
                    eventSameMess("Scrapper_Error",'Page is not fully loaded, waiting for load !');
                }
            } else{
                scrapperTerminationFlag(load_res.data);
                return;
            }
        })
    }

    this.evaluatePageRet = function(){
        if(opts.data.button_loading === 0 && opts.data.single_page === 0){
            if(CURRENT_PAGE == 4){
                eventSameMess("Scrapper ",'A L L P A G E S S C R A P P E D');
                _this.evaluateJobsDetailsRet();
                return;                                                                                                                                        
            } else{
                scrap.evaluatePage(opts.data.page_jobs_data_code).then(function(flag_evpg){
                    if(!flag_evpg.success){
                        scrapperTerminationFlag(flag_evpg.data);
                        return;
                    } else{
                        eventSameMess("Scrapped Page Data",flag_evpg); 
                        ALL_PAGES_JOBS_DATA.push(flag_evpg.data);
                        scrap.clickNext(opts.data.next_page_button_code).then(function(flag_ntpg){
                            console.log("THis is Pagination Next button loading site !");
                            if(flag_ntpg.success){
                                var fill = Math.round(((CURRENT_PAGE+JOB_NUMBER)/(4+40)*100)*100)/100;
                                defEvent.emit("hitBar",fill);
                                CURRENT_PAGE++;
                                _this.evaluatePageRet();
                            } else {
                                scrapperTerminationFlag(flag_ntpg.data);
                                return;
                            }
                        })
                    }
                })
            }
        }
        else if(opts.data.button_loading === 1 && opts.data.button_loading_code.toLowerCase() !== "none"){
            console.log("THis is button loading site !");
            if(CURRENT_LOADED_JOBS >= TOTAL_JOBS){
                eventSameMess("Scrapper ",'A L L P A G E S S C R A P P E D');
                _this.evaluateJobsDetailsRet();
                return;                                                                                                                                        
            } else{
                scrap.evaluatePage(opts.data.page_jobs_data_code).then(function(flag_evpg){
                    if(!flag_evpg.success){
                        scrapperTerminationFlag(flag_evpg.data);
                        return;
                    } else{
                        eventSameMess("Scrapped Page Data",flag_evpg.data); 
                        ALL_PAGES_JOBS_DATA.push(flag_evpg.data);
                        scrap.btnClick(opts.data.next_page_button_code).then(function(flag_ntpg){
                            console.log("THis is Same button loading site !");
                            if(flag_ntpg.success){
                                var fill = Math.round(((CURRENT_PAGE+JOB_NUMBER)/(4+40)*100)*100)/100;
                                defEvent.emit("hitBar",fill);
                                CURRENT_PAGE++;
                                _this.evaluatePageRet();
                            } else {
                                scrapperTerminationFlag(flag_ntpg.data);
                                return;
                            }
                        })
                    }
                })
            }
        }
    }




    this.evaluateJobsDetailsRet = function(){
        // defEvent.emit("hitDefConsole",ALL_PAGES_JOBS_DATA);
        if(!scrapperTermination()){
            defEvent.emit("initCompStats");
            if(PAGE_COUNTER === ALL_PAGES_JOBS_DATA.length){

                LAST_NEW_JOBS_FOUND = TOTAL_JOBS - LAST_NEW_JOBS_FOUND;
                LAST_SCRAPPED_TIME = getTime(); 
                defEvent.emit("getTotalTime");
                defEvent.on("showTotalTime",function(data){
                    LAST_TOTAL_TIME_TAKEN = data;
                    REFERENCE_KEY = opts.info.id;
                    LAST_SCRAPPED_DATE = new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear();
                    ms_connect.query("INSERT INTO company_scrapping_details VALUES ("+null+","+TOTAL_JOBS+","+TOTAL_PAGES+",'"+LAST_SCRAPPED_TIME+"','"+LAST_SCRAPPED_DATE+"',"+LAST_NEW_JOBS_FOUND+",'"+LAST_TOTAL_TIME_TAKEN+"',"+REFERENCE_KEY+")",function(err){
                         if(err){
                             eventSameMess("database_error",err+" ");
                         } else{
                             eventSameMess("Scrapper ", "*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*");
                             eventSameMess("Scrapper ", " O V E R A L L - S C R A P P I N G - F I N I S H E D- FOR - SITE - "+opts.info.name.toUpperCase());
                             eventSameMess("Scrapper ", "*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*~*");
                             defEvent.emit("siteScrapped");                                                                                                                
                         }
                     }); 
                     return;
                });
     
             } else{
                 if(PAGE_DATA_COUNTER === ALL_PAGES_JOBS_DATA[PAGE_COUNTER].length){
                     eventSameMess("Scrapper ", "Scrapping for page # <span class='bold'>"+(PAGE_COUNTER+1)+"</span> finished !");
                     PAGE_DATA_COUNTER = 0;
                     PAGE_COUNTER++;
                     PAGE_NUMBER++;
                     _this.evaluateJobsDetailsRet();
                 }else{
                     var job_url = ALL_PAGES_JOBS_DATA[PAGE_COUNTER][PAGE_DATA_COUNTER].link,
                         jd_code = opts.data.jobs_details_code;               
                     scrap.evaluateJobsDetails(job_url, jd_code).then(function(jb_ev_res){
                         if(!jb_ev_res.success){
                             scrapperTerminationFlag(jb_ev_res.data);
                             return;
                         } else{
                             var fill = Math.round(((CURRENT_PAGE+JOB_NUMBER)/(2+20)*100)*100)/100;
                             defEvent.emit("hitBar",fill);
                             CURRENT_JOB = PAGE_DATA_COUNTER+1;
                             PAGE_DATA_COUNTER++;
                             JOB_NUMBER++;

                             eventSameMess("Scrapper Data ", ALL_PAGES_JOBS_DATA[PAGE_COUNTER][PAGE_DATA_COUNTER] );
     
                             defEvent.emit("UIMetaUpdates",{website:CURR_WEBSITE_INDEX,job:CURRENT_JOB,page:PAGE_COUNTER+1});
                             _this.evaluateJobsDetailsRet();
                         }
                     })
                 }
             }
        } else{
            return scrapperTermination();
        }
    }
}



defEvent.on("stopScrapping",function(b){
    TERMINATE_FUNCTION.on = b;
    TERMINATE_FUNCTION.flag = "STOP";
});

defEvent.on("pauseScrapping",function(b){
    TERMINATE_FUNCTION.on = b;
    TERMINATE_FUNCTION.flag = "PAUSE";
});

function scrapperTermination(){
    if(TERMINATE_FUNCTION.on){
        switch(TERMINATE_FUNCTION.flag){
            case "STOP":{
                return {data:"SCRAPPER_STOPPED",success:false};
                break;
            }
            case "PAUSE":{
                return {data:"SCRAPPER_PAUSED",success:false};
                break;
            }
        }
    } else{
        return false;
    }
}

function scrapperTerminationFlag(flag){
   switch(flag){
        case "SCRAPPER_STOPPED":{
            eventSameMess("Scrapper ","Scrapper has been Stopped, Successfully !");
            break;
        }
        case "SCRAPPER_PAUSED":{
            eventSameMess("Scrapper ","Scrapper has been Paused, Successfully !");
            scrapperPause();
            break;
        }
   }
}

function scrapperPause(){

    var months = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

    defEvent.emit("pauseSuccess",{
        site :  CURR_WEBSITE_INDEX, 
        page :  PAGE_COUNTER+1, 
        job  :  CURRENT_JOB, 
        url  :  MAIN_URL,
        name :  CURR_WEBSITE_NAME,
        time :  getTime(),
        date :  new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear(),
        dateText : (months[new Date().getMonth()])+" "+new Date().getDate()+", "+new Date().getFullYear()
    });

}

// function getDate(){
//     var months = ["Jan", "Feb", "Mar", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     return {
//         date :  new Date().getDate()+"/"+(new Date().getMonth()+1)+"/"+new Date().getFullYear(),
//         dateText : (months[new Date().getMonth()])+" "+new Date().getDate()+", "+new Date().getFullYear()
//     }
// }
function getTime(){
    var d   =  new Date(),
        h   =  d.getHours(),
        m   =  d.getMinutes(),
        s   =  d.getSeconds(),
        hh   =  ( h < 10   )  ?  "0"+h   :  h,
        hh   =  ( h == 0   )  ?  h = 12  :  h,
        hh   =  ( h >= 12   )  ?  h-12    :  h,
        mm   =  ( m < 10   )  ?  "0"+m   :  m,
        ss   =  ( s < 10   )  ?  "0"+s   :  s,
        t    =  ( h  >= 12  )  ?  "PM"    :  "AM";
    return hh+":"+mm+":"+ss+" "+t;
}

/*
****************************************************************************************************************
****************************************************************************************************************
                                                ADD COMPANIES
****************************************************************************************************************
****************************************************************************************************************
*/

function AddCompany(data){

    var name,
        loc,
        url,
        img,
        code,
        siteLoadWait = 0 ,
        nextPageLoadWait = 0 ,
        pagination = 0,
        jsLoaded = 0,
        pagesDefined = 0,
        buttonLoading = 0 ,
        singlePage = 0,
        originAdding = 0,
        addingSlashAfterOrigin = 0,
        nextPageButtonCode,
        jobsMetaCode,
        pagesMetaCode,
        pageJobsCode,
        jobsDetailsCode,
        buttonLoadingCode,
        undefinedPagesCode,
        currentPageLoadedJobs,
        refereceKey;

    for (let i = 0; i < data.length; i++) {
        switch(data[i].name){
            case 'as-comp-name'    :  {  name                    =   data[i].value;   break;   }
            case 'as-comp-loc'     :  {  loc                     =   data[i].value;   break;   }
            case 'as-comp-url'     :  {  url                     =   data[i].value;   break;   }
            case 'as-comp-logo'    :  {  img                     =   data[i].value;   break;   }
            case 'as-comp-code'    :  {  code                    =   data[i].value;   break;   }
            case 'as-comp-ltime'   :  {  pageLoadWait            =   data[i].value;   break;   }
            case 'as-comp-npltime' :  {  nextPageLoadWait        =   data[i].value;   break;   }
            case 'as-comp-npbcode' :  {  nextPageButtonCode      =   data[i].value;   break;   }
            case 'as-comp-pmcode'  :  {  pagesMetaCode           =   data[i].value;   break;   }
            case 'as-comp-jmcode'  :  {  jobsMetaCode            =   data[i].value;   break;   }
            case 'as-comp-pjcode'  :  {  pageJobsCode            =   data[i].value;   break;   }
            case 'as-comp-jdcode'  :  {  jobsDetailsCode         =   data[i].value;   break;   }
            case 'as-comp-upcode'  :  {  undefinedPagesCode      =   data[i].value;   break;   }
            case 'as-comp-blcode'  :  {  buttonLoadingCode       =   data[i].value;   break;   }
            case 'as-comp-cplj'    :  {  currentPageLoadedJobs   =   data[i].value;   break;   }
            //Boolearn Values
            case 'as-comp-pbool'   :  {  pagination              =   (data[i].value == "on") ? 1 : 0 ; break; }
            case 'as-comp-jbool'   :  {  jsLoaded                =   (data[i].value == "on") ? 1 : 0 ; break; }
            case 'as-comp-dpbool'  :  {  pagesDefined            =   (data[i].value == "on") ? 1 : 0 ; break; }
            case 'as-comp-blbool'  :  {  buttonLoading           =   (data[i].value == "on") ? 1 : 0 ; break; }
            case 'as-comp-spbool'  :  {  singlePage              =   (data[i].value == "on") ? 1 : 0 ; break; }
            case 'as-comp-aobool'  :  {  originAdding            =   (data[i].value == "on") ? 1 : 0 ; break; }
            case 'as-comp-aosbool' :  {  addingSlashAfterOrigin  =   (data[i].value == "on") ? 1 : 0 ; break; }
        }
    }


    if(
        name != "" ||
        loc != "" ||
        url != "" ||
        img != "" ||
        code != "" ||
        siteLoadWait != "" ||
        nextPageLoadWait != "" ||
        nextPageButtonCode != "" ||
        jobsMetaCode != "" ||
        pagesMetaCode != "" ||
        pageJobsCode != "" ||
        jobsDetailsCode != "" ||
        buttonLoadingCode != "" ||
        currentPageLoadedJobs != "" ||
        undefinedPagesCode != ""
    ){
        ms_connect.query('INSERT INTO companies VALUES ('+null+',"'+name+'","'+loc+'","'+url+'","'+img+'","'+code+'")',function(err,rows,fields){
            if(err){
                eventSameMess("database_error","Data submission error : " + err);
            } else{
                eventSameMess("Database","Data inserted Successfully into COMPANIES table !");
                refereceKey = rows.insertId;
                ms_connect.query("INSERT INTO companies_codes VALUES("+null+","+pageLoadWait+","+nextPageLoadWait+","+pagination+","+jsLoaded+","+pagesDefined+","+buttonLoading+","+singlePage+","+originAdding+","+addingSlashAfterOrigin+",'"+nextPageButtonCode+"','"+jobsMetaCode+"','"+pagesMetaCode+"','"+pageJobsCode+"','"+jobsDetailsCode+"','"+buttonLoadingCode+"','"+currentPageLoadedJobs+"','"+undefinedPagesCode+"',"+refereceKey+")",function(err,rows,fields){
                    if(err){
                        eventSameMess("database_error",err+" ");
                    } else{
                        eventSameMess("Database","Data inserted Successfully into COMPANIES CODES table !");
                    }
                })
            }
        })

    } else{
        defEvent.emit("site-add-error","Fields are required !");
    }
   
}


/*
****************************************************************************************************************
****************************************************************************************************************
                                                SHOW THE SCRAPER STATS
****************************************************************************************************************
****************************************************************************************************************
*/


function ScrapperStats(){

   this.currentStats = function(){
       var stats = {
                        url          :     MAIN_URL,
                        pages        :     TOTAL_PAGES,
                        jobs         :     TOTAL_JOBS,
                        jobNum       :     JOB_NUMBER, 
                        pageNum      :     PAGE_NUMBER, 
                        snaps        :     SNAPS_COUNTER, 
                        currentSite  :     CURRENT_WEBSITE,
                        siteName     :     CURR_WEBSITE_NAME, 
                        running      :     TERMINATE_FUNCTION.on
                    };
       return stats;
   }

}



function eventSameMess(auth,mess){
    defEvent.emit("hitConsole",{a:auth,m:mess});
}



module.exports = {ScrapData,AddCompany,ScrapperStats,defEvent,ms_connect};










