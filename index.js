const express= require("express");
const fs=require("fs");
const sharp = require("sharp");
const sass = require('sass');
const {Client} = require("pg"); 
var cssBootstrap = sass.compile(__dirname+"/resurse/scss/customizare-bootstrap.scss", {sourceMap:true});
fs.writeFileSync(__dirname+"/resurse/css/biblioteci/bootstrap-custom.css", cssBootstrap.css);

var client = new Client({database:"footstore",
            user:"daniel",
            password:"daniel",
            host:"localhost",
            port:5432});
client.connect();

client.query("select * from unnest(enum_range(null::categ_adidas))", function(err, rez){
    if(err)
        console.log(err);
    else
         console.log(rez);
});

app=express();

app.set("view engine","ejs");
console.log("Cale proiect:", __dirname);
app.use("/resurse",express.static(__dirname+"/resurse"));
/*
app.get("/*", function(req, res, next){
    console.log("1111");
    //res.send("Ha ha ha!");
    res.write("123");
    next();
})*/
 
obGlobal={
    erori:null,
    imagini:null

}

app.use("/*", function(req, res, next){
    client.query("select * from unnest(enum_range(null::categ_adidas))", function(err, rezTip){
        if(err){
            console.log(err);
            renderError(res, 2);
        } else {
            res.locals.optiuniMeniu = rezTip.rows;
            next();
        }
    });
});


function createErrors(){
    var continutFisier=fs.readFileSync(__dirname+"/resurse/json/erori.json").toString("utf8");
    //console.log(continutFisier);
    obGlobal.erori=JSON.parse(continutFisier);
    //console.log(obErori.erori);
}
createErrors();

function createImages(){
    var continutFisier=fs.readFileSync(__dirname+"/resurse/json/galerie.json").toString("utf8");
    //console.log(continutFisier);
    var obiect=JSON.parse(continutFisier);
    var dim_mediu = 300;
    var dim_mic = 150;

    obGlobal.imagini = obiect.imagini;
    obGlobal.imagini.forEach(function(elem){
        [numeFisier, extensie]=elem.cale_imagine.split(".");

        if(!fs.existsSync(obiect.cale_galerie + "/mediu/")){
            fs.mkdirSync(obiect.cale_galerie + "/mediu/");
        }

        elem.cale_imagine_mediu = obiect.cale_galerie + "/mediu/" + numeFisier + ".webp"

        if(!fs.existsSync(obiect.cale_galerie + "/mic/")){
            fs.mkdirSync(obiect.cale_galerie + "/mic/");
        }

        elem.cale_imagine_mic = obiect.cale_galerie + "/mic/" + numeFisier + ".webp"

        elem.cale_imagine = obiect.cale_galerie + "/" + elem.cale_imagine;

        sharp(__dirname+"/"+elem.cale_imagine).resize(dim_mediu).toFile(__dirname+"/"+elem.cale_imagine_mediu);
        sharp(__dirname+"/"+elem.cale_imagine).resize(dim_mic).toFile(__dirname+"/"+elem.cale_imagine_mic);

    });

    console.log(obGlobal.imagini);
}
createImages();

function renderError(res, identificator, titlu, text, imagine){
    var eroare = obGlobal.erori.info_erori.find(function(elem){
        return elem.identificator==identificator;
    })
    titlu= titlu || (eroare && eroare.titlu) || obGlobal.erori.eroare_default.titlu;
    text= text || (eroare && eroare.text) || obGlobal.erori.eroare_default.text;
    imagine= imagine || (eroare && obGlobal.erori.cale_baza+"/"+eroare.imagine) || obGlobal.erori.cale_baza+"/"+obGlobal.erori.eroare_default.imagine;
    if(eroare && eroare.status){
        res.status(identificator).render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine})
    }
    else{
        res.render("pagini/eroare", {titlu:titlu, text:text, imagine:imagine});
    }
}


app.get(["/","/index","/home"],function(req, res){
    console.log("ceva");
    //res.sendFile(__dirname+ "/index.html");
    //res.write("nu stiu");
    //res.end();
    res.render("pagini/index", {ip: req.ip, imagini: obGlobal.imagini});
});



app.get("/produse",function(req, res){
    console.log(req.query);

    client.query(("select * from unnest(enum_range(null::categ_adidas))"), function(err, rezCateg){

        continuareQuery = ""
        if(req.query.tip)
            continuareQuery += ` and categorie_adidas='${req.query.tip}'`  //tip = `"+req.query.tip"`

        client.query("select * from adidasi where 1=1 " + continuareQuery, function(err, rez){
            if(err) {
                console.log(err); 
                renderError(res, 2);
            }
            else {
                 res.render("pagini/produse",
                 { produse: rez.rows, 
                   optiuni: res.locals.optiuniMeniu}); 
            }
        });
    });
});

app.get("/produs/:id",function(req, res){

    client.query("select * from adidasi where id=" +req.params.id, function(err, rez){
        if(err) {
            console.log(err); 
            renderError(res, 2);
        }
        else
    res.render("pagini/produs", { prod: rez.rows[0]});
    });
});


app.get("/*.ejs", function(req, res){
    renderError(res,403);
});

app.get("/*",function(req, res){
    console.log("url:",req.url);
    //res.sendFile(__dirname+ "/index.html");
    //res.write("nu stiu");
    //res.end();
    res.render("pagini"+req.url, function(err,rezRandare){
        //console.log("Eroare", err);
        //console.log("Rezultat randare", rezRandare);

        if(err){
            if(err.message.includes("Failed to lookup view")){
                renderError(res,404,"404: Destinație negăsită");
            }
            else{

            }
        }
        else{
            res.send(rezRandare);
        }


    });
});
console.log("Hello world!");

app.listen(8080);
console.log("Serverul a pornit!");