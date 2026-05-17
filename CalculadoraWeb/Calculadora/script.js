let pantalla = document.getElementById("pantalla");

function agregar(valor){
    pantalla.value += valor;
}

function limpiar(){
    pantalla.value = "";
}

function borrar(){
    pantalla.value = pantalla.value.slice(0, -1);
}

function calcular(){
    try{
        pantalla.value = eval(pantalla.value);
    }catch{
        pantalla.value = "Error";
    }
}