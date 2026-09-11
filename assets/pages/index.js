// Configuração do Broker MQTT
const MQTT_HOST = "broker.hivemq.com"; // Troque pelo IP do seu Mosquitto se for local
const MQTT_PORT = 8000;                // Porta WebSocket do broker
const MQTT_CLIENT_ID = "Cliente_Dashboard_" + Math.random().toString(16).substr(2, 8);

// Tópicos configurados no ESP32
const TOPICO_TEMP = "trupi/ambiente/temperatura";
const TOPICO_UMID = "trupi/ambiente/umidade";
const TOPICO_GAS  = "trupi/ambiente/qualidade_ar";

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
    client = new Paho.MQTT.Client(MQTT_HOST, Number(MQTT_PORT), MQTT_CLIENT_ID);

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
    client.subscribe(TOPICO_TEMP);
    client.subscribe(TOPICO_UMID);
    client.subscribe(TOPICO_GAS);
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

    if (topico === TOPICO_TEMP) {
        document.getElementById("temp").innerText = `${valor}°C`;
    } else if (topico === TOPICO_UMID) {
        document.getElementById("umid").innerText = `${valor}%`;
    } else if (topico === TOPICO_GAS) {
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