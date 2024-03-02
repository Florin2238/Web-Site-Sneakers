window.onload = function() {
    document.getElementById('filtrare').onclick = function() {
        var inpNume = document.getElementById("inp-nume").value.toLowerCase().trim();
        var inpCategorie = document.getElementById("inp-categorie").value;
        var inpRange = document.querySelector('input[name="gr_rad"]:checked').value.split(':');
        var minPret = parseInt(inpRange[0]);
        var maxPret = parseInt(inpRange[1]);

        var inpDatalist = document.getElementById("i_datalist").value.toLowerCase().trim();
        var inpRange2 = parseInt(document.getElementById("inp-pret").value);

        var produse = document.getElementsByClassName("produs");

        for(let produs of produse){
            var cond1 = false, cond2 = false, cond3 = false, cond4 = false, cond5 = false;
            produs.style.display = "none";

            let nume = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            if(nume.includes(inpNume)){
                cond1 = true;
            }

            let categorie = produs.getElementsByClassName("val-categorie")[0].innerHTML;
            if(categorie == inpCategorie || inpCategorie == "toate"){
                cond2 = true;
            }

            let pret = parseFloat(produs.getElementsByClassName("val-pret")[0].innerHTML);
            if(pret >= minPret && pret <= maxPret || inpRange == "toate"){
                cond3 = true;
            }

            let cautare = produs.getElementsByClassName("val-nume")[0].innerHTML.toLowerCase().trim();
            if(cautare.includes(inpDatalist)){
                cond4 = true;
            }

            let range = parseFloat(produs.getElementsByClassName("val-pret")[0].textContent);
            if (range >= inpRange2 || isNaN(inpRange2)) {
                cond5 = true;
            }
            

            if(cond1 && cond2 && cond3 && cond4 && cond5){
                produs.style.display = "block";
            }
        }
    }
            // Obținem elementele input și span
            var rangeInput = document.getElementById('inp-pret');
            var infoRangeSpan = document.getElementById('infoRange');
            
            // Adăugăm un eveniment care să se declanșeze atunci când valoarea range-ului este schimbată
            rangeInput.addEventListener('input', function() {
                // Actualizăm textul pentru a afișa valoarea selectată
                infoRangeSpan.textContent = '(' + rangeInput.value + ' lei)';
            });
       
}
