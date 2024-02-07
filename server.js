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


app.get(['/', '/index', 'aggiungi'], (req, res) => {
    res.render('index', { squadre });
});

app.post('/controlli', (req, res, next) => {
    const squadre = readSquadre();

    let { squadra1, squadra2, punteggio1, punteggio2 } = req.body;

    //10 sta per indicare che è di tipo decimale
    punteggio1 = parseInt(punteggio1, 10);
    punteggio2 = parseInt(punteggio2, 10);
    if (isNaN(punteggio1) || isNaN(punteggio2)) {
        // Se i punteggi non sono numeri validi, reindirizza con un messaggio di errore
        return res.render('index', { squadre, errore: 'Inserisci un punteggio valido. I punteggi devono essere numeri.' });
    }

    if (squadra1 === squadra2) {
        return res.render('index', { squadre, errore: 'Una squadra non può scontrarsi contro se stessa. Seleziona due squadre diverse.' });
    }

    if (punteggio1 < 0 || punteggio2 < 0) {
        return res.render('index', { squadre, errore: 'Una squadra non può aver fatto un punteggio negativo. Inserisci un punteggio positivo' });
    }

    //assegna all'oggetto req.validatedData
    req.SquadreValide = {
        squadra1,
        squadra2,
        punteggio1,
        punteggio2
    };
    
    // next permette la chiamata alla funzione (middleware successivo)
    next();
}, calcolaPunteggi); //chiamata alla funzione

function calcolaPunteggi(req, res) {
    const squadre = readSquadre();

    let { squadra1, squadra2, punteggio1, punteggio2 } = req.SquadreValide;

    let squadravincitrice1 = squadre.find(squadra => squadra.nome === squadra1);
    let squadravincitrice2 = squadre.find(squadra => squadra.nome === squadra2);

    punteggio1 = parseInt(punteggio1, 10);
    punteggio2 = parseInt(punteggio2, 10);

    /*console.log(punteggio1);
    console.log(punteggio2);*/

    if (punteggio1 > punteggio2) {
        squadravincitrice1.punti += 3;
        //console.log(squadravincitrice1.nome);
    }

    else if (punteggio2 > punteggio1) {
        squadravincitrice2.punti += 3;
    }

    else {
        squadravincitrice1.punti += 1;
        squadravincitrice2.punti += 1;
    }

    writeSquadre(squadre);
    res.render('index', { squadre: readSquadre() });
};

app.post('/azzera', (req, res) => {
    const squadre = readSquadre();

    squadre.forEach(squadra => {
        squadra.punti = 0;
        //console.log("PUNTI SQUADRA= " + squadra.punti);
    });
    writeSquadre(squadre);

    res.render('index', { squadre: readSquadre() });
});

app.post('/classifica', (req, res) => {
    let squadre = readSquadre();

    // Ordina le squadre per punti in ordine decrescente
    squadre.sort((a, b) => b.punti - a.punti);

    // Assegna la posizione considerando squadre con lo stesso numero di punti per renderle alla pari
    let posizioneAttuale = 0; 
    let puntiPrecedenti = -1; 
    let squadreConStessiPunti = 0; 

    squadre.forEach((squadra, indice) => {
        if (squadra.punti !== puntiPrecedenti) {
            posizioneAttuale += squadreConStessiPunti + 1; // Aggiorna la posizione attuale
            squadreConStessiPunti = 0; 
        } else {
            squadreConStessiPunti++; // Incrementa il conteggio se i punti sono uguali a quelli della squadra precedente
        }
        squadra.posizione = posizioneAttuale; // Assegna la posizione corretta alla squadra
        puntiPrecedenti = squadra.punti; 
    });

    res.render('classifica', { squadre });
});


app.listen(3000, () => {
    console.log('Server avviato su http://localhost:3000');
});