var request = require('request')
var cheerio = require('cheerio')
var fs = require('fs');


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

console.log("Start...");

works = []


var promises = [];

promises.push(new Promise(
    crawlerData("doctor","http://www.mdcc.ufc.br/teses-e-dissertacoes/cat_view/36-/37-teses-de-doutorado")));

for(let i=5; i < 60; i+=5){
    promises.push(new Promise(
        crawlerData("doctor","http://www.mdcc.ufc.br/teses-e-dissertacoes/cat_view/36-/37-teses-de-doutorado?start="+i)));
}

Promise.all(promises).then(function() {
    fs.writeFile('doctors.json', JSON.stringify({works:works}), 'utf8', ()=>{
        console.log("Finish " + works.length + " records");
    });
   
}, function(err) {
    console.log(err);
});




function crawlerData(degree,req){
    return function(resolve, reject) {
        request(req,

            function(err,res,body){
        
             try {
                    
                var $ = cheerio.load(body,{ decodeEntities: false });

                $('div.dm_description').each(function(i, element){
                    
                    let name = null;
                    let date = null;
                    let title = null;
                    let advisor = null;
                    let coor_advisor = null;

                    $('h3.dm_title').each(function(i2, element){    
                        if(i == i2){
                        name = $(this).children('a').text().split(".")[1].trim();
                        
                        }  
                    });

                    let complement = $(this).children('p').text(); //all P
                         

                    let content = complement.split("Banca Examinadora:");   
                    
                    if(content.length == 1){
                        content = complement.split("Banca Examinhadora:");
                    }  
                    if(content.length == 1){
                        content = complement.split("Banca examinadora:");
                    }  
                    if(content.length == 1){
                        content = complement.split("Data:");
                    } 


                   // console.log("1: " + content[0]) //TITULO
                   // console.log("2: " + content[1]) //DATA

                    title = content[0].replaceAll("Título:","").trim();
                    date = content[1].replace("Data:","").trim();

                   
                    //// -------------------------------

                    let professors = $(this).children('blockquote').text();

                    professors = professors
                            .replaceAll("ª","")
                            .replaceAll("Profa.","")
                            .replaceAll("Dra.","")
                            .replaceAll("Prof.","")
                            .replaceAll("Dr.","");
                   
                    professors = professors.split(")");
                    let formartProfs = [];

                    for(p in professors){
                        
                        if(professors[p].trim() == ""){
                            continue;
                        }

                        let aux = professors[p].split("(");   //professor name (UFC - Orientador 
                        
                        if(aux[1].includes("Orientador") || aux[1].includes("Orientadora")){
                            advisor = aux[0].trim();
                        }
                        if(aux[1].includes("Coorientador") || aux[1].includes("Coorientador")){
                            coor_advisor = aux[0].trim();
                        }
                        if(aux[1].includes("Orientadora") || aux[1].includes("Orientadora")){
                            advisor = aux[0].trim();
                        }
                        if(aux[1].includes("Coorientadora") || aux[1].includes("Coorientador")){
                            coor_advisor = aux[0].trim();
                        }
                        

                        let org = aux[1]
                                    .replace("Coorintadora","")
                                    .replace("Coorientador","")
                                    .replace("Orientadora","")
                                    .replace("Orientador","")
                                    .replace("-","");

                        let prof = {
                            name: aux[0].trim(),
                            organization: org.trim()
                        }
                        formartProfs.push(prof);

                        
                    } 
                    /*
                    console.log("Name: " + name);
                    console.log("Title: " + title);
                    console.log("Date: " + date);
                    console.log("Advisor: " + advisor);
                    console.log("CoorAdvisor: " + coor_advisor);
                    
                    for(p in formartProfs){
                        prof = formartProfs[p];
                        console.log("+ " + prof.name + " / " + prof.organization );

                    }
   
                    console.log("----------------------------------------")
                    */

                    let work = {
                        name: name,
                        title:title,
                        date:date,
                        advisor:advisor,
                        coor_advisor:coor_advisor,
                        examination_board:formartProfs,
                        degree:degree
                    }

                    works.push(work);
                    resolve(work);
                    
                    //console.log(JSON.stringify(work));
                    //console.log("-----------------")
                    

                });

        }catch(e){
           console.error(e + " " + req);
           process.exit();

        }
        
        }

        );

    

   
    }    

}

