// Configuração do Broker MQTT
const MQTT_HOST = "10.12.192.16"; // Troque pelo IP do seu Mosquitto se for local
const MQTT_PORT = 9001;                // Porta WebSocket do broker
const MQTT_CLIENT_ID = "Cliente_Dashboard_" + Math.random().toString(16).substr(2, 8);

// Tópicos configurados no ESP32
const TOPIC_TEMP = "aulas/trupi/temperatura";
const TOPIC_HUM = "aulas/trupi/umidade";
const TOPIC_AIR  = "aulas/trupi/qualidade_ar";

let client = null;

document.addEventListener("DOMContentLoaded", () => {
    conectarMQTT();
});

// Navegação de Abas
function mudarAba(nomeAba) {
    const abas = document.querySelectorAll(".aba-conteudo");
    abas.forEach(aba => aba.classList.remove("active"));

    const botoes = document.querySelectorAll(".btn-aba");
    botoes.forEach(btn => btn.classList.remove("active"));

    const abaSelecionada = document.getElementById(`aba-${nomeAba}`);
    if (abaSelecionada) {
        abaSelecionada.classList.add("active");
    }

    const btnSelecionado = document.getElementById(`btn-${nomeAba}`);
    if (btnSelecionado) {
        btnSelecionado.classList.add("active");
    }
}

// Conexão Paho MQTT
function conectarMQTT() {
   client = new Paho.MQTT.Client(MQTT_HOST, Number(MQTT_PORT), "/mqtt", MQTT_CLIENT_ID);

    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    const options = {
        timeout: 3,
        onSuccess: onConnect,
        onFailure: onFailure
    };

    client.connect(options);
}

function onConnect() {
    atualizarStatusMQTT(true);
    client.subscribe(TOPIC_TEMP);
    client.subscribe(TOPIC_HUM);
    client.subscribe(TOPIC_AIR);
}

function onFailure(error) {
    atualizarStatusMQTT(false);
    console.error("Erro na conexão MQTT: ", error.errorMessage);
    setTimeout(conectarMQTT, 5000);
}

function onConnectionLost(responseObject) {
    atualizarStatusMQTT(false);
    if (responseObject.errorCode !== 0) {
        console.warn("Conexão perdida: ", responseObject.errorMessage);
        setTimeout(conectarMQTT, 5000);
    }
}

function onMessageArrived(message) {
    const topico = message.destinationName;
    const valor = message.payloadString;

    if (topico === TOPIC_TEMP) {
        document.getElementById("temp").innerText = `${valor}°C`;
    } else if (topico === TOPIC_HUM) {
        document.getElementById("umid").innerText = `${valor}%`;
    } else if (topico === TOPIC_AIR) {
        document.getElementById("gas").innerText = `${valor} AIR`;
    }
}

function atualizarStatusMQTT(conectado) {
    const statusElem = document.getElementById("status-mqtt");
    if (!statusElem) return;

    if (conectado) {
        statusElem.innerText = "Status: Conectado ao Broker";
        statusElem.className = "conectado";
    } else {
        statusElem.innerText = "Status: Desconectado";
        statusElem.className = "desconectado";
    }
}