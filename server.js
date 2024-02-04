const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const fs = require("fs");

app.set('view engine', 'pug');
app.set('views', './views');

const RottaPublic = path.join(__dirname, "public");
app.use(express.static(RottaPublic));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
//const punteggi = readPunteggi();
const squadre = readSquadre();

function readSquadre() {
    try {
        const squadreJson = fs.readFileSync("squadre.json", 'utf-8');
        // Converte il contenuto JSON in un oggetto JavaScript
        return JSON.parse(squadreJson);
    } catch (error) {
        console.log(error);
        return [];
    }
}
function writeSquadre(squadreJson) {//scrive nel file json con unaindendazione di uno spazio
    fs.writeFileSync("squadre.json", JSON.stringify(squadreJson, null, 1), 'utf-8');
}
function save() {
    writeSquadre(squadre);
}


app.get(['/', '/index', 'aggiungi'], (req, res) => {
    res.render('index', { squadre });
});


app.post('/calcolo', (req, res) => {
    let squadre = readSquadre();

    let squadra1 = req.body.squadra1;
    let squadra2 = req.body.squadra2;
    let punteggio1 = req.body.punteggio1;
    let punteggio2 = req.body.punteggio2;

    let squadravincitrice1 = squadre.find(squadra => squadra.nome === squadra1);
    let squadravincitrice2 = squadre.find(squadra => squadra.nome === squadra2);
    console.log(punteggio1);
    console.log(punteggio2);

    if (punteggio1 > punteggio2) {
        squadravincitrice1.punti += 3;
        //console.log(squadravincitrice.nome);
    }

    else if (punteggio2 > punteggio1) {
        squadravincitrice2.punti += 3;
    }

    else {
        squadravincitrice1.punti += 1;
        squadravincitrice2.punti += 1;
    }

    writeSquadre(squadre);
    //save();
    res.render('index', { squadre: readSquadre() });
});

app.post('/azzera', (req, res) => {
    let squadre = readSquadre();

    squadre.forEach(squadra => {
        squadra.punti = 0; // Fai qualcosa con ogni squadra
        //console.log("PUNTI SQUADRA= " + squadra.punti);
    });
    writeSquadre(squadre);

    res.render('index', { squadre: readSquadre() });

});


app.listen(3000, () => {
    console.log('Server avviato su http://localhost:3000');
});