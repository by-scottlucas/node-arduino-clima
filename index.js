import { SerialPort } from 'serialport';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.API_KEY;
const DATA_REFRESH_INTERVAL = 300000;
const BOARD_PORT = process.env.BOARD_PORT;

const city = process.env.CITY;
const neighborhood = process.env.NEIGHBORHOOD;

let latitude = null;
let longitude = null;

function removeAccents(text) {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/[^a-zA-Z\s]/g, '');
}

const serialConnection = new SerialPort({
  path: BOARD_PORT,
  baudRate: 9600,
});

serialConnection.on('open', async () => {
  console.log(`[NodeJS] Porta serial ${BOARD_PORT} aberta.`);

  if (neighborhood) {
    console.log(`[NodeJS] Tentando obter coordenadas para o bairro: ${neighborhood}, ${city}...`);
    await tryGetCoordinatesForNeighborhood();
  } else {
    console.log(`[NodeJS] Buscando coordenadas para a cidade: ${city}...`);
    await getCoordinatesForCity();
  }

  if (latitude && longitude) {
    console.log(`[NodeJS] Iniciando busca de clima usando coordenadas Lat ${latitude}, Lon ${longitude}...`);
    setTimeout(() => {
      fetchWeatherData();
      setInterval(fetchWeatherData, DATA_REFRESH_INTERVAL);
    }, 2000);
  } else {
    console.error('[NodeJS] Nao foi possivel obter coordenadas. Nao sera possivel buscar o clima.');
  }
});

serialConnection.on('error', (err) => {
  console.error('[NodeJS] ERRO FATAL na porta serial:', err.message);
});

serialConnection.on('close', () => {
  console.log('[NodeJS] Porta serial fechada.');
});

async function tryGetCoordinatesForNeighborhood() {
  try {
    const query = `${encodeURIComponent(neighborhood)},${encodeURIComponent(city)},SP,BR`;
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      latitude = data[0].lat;
      longitude = data[0].lon;
      console.log(`[NodeJS] Coordenadas encontradas para ${neighborhood}`);
    } else {
      console.warn(`[NodeJS] Bairro "${neighborhood}" não encontrado. Usando coordenadas da cidade: ${city}.`);
      await getCoordinatesForCity();
    }
  } catch (err) {
    console.error('[NodeJS] Erro ao buscar coordenadas do bairro:', err.message);
    console.warn(`[NodeJS] Falha na busca por bairro. Tentando usar coordenadas da cidade: ${city}.`);
    await getCoordinatesForCity();
  }
}

async function getCoordinatesForCity() {
  try {
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)},BR&limit=1&appid=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data.length > 0) {
      latitude = data[0].lat;
      longitude = data[0].lon;
      console.log(`[NodeJS] Coordenadas encontradas para ${city}: Lat ${latitude}, Lon ${longitude}`);
    } else {
      console.error(`[NodeJS] Erro: Nao foi possivel encontrar coordenadas para ${city}.`);
      latitude = null;
      longitude = null;
    }
  } catch (err) {
    console.error('[NodeJS] Erro ao buscar coordenadas da cidade:', err.message);
  }
}

async function fetchWeatherData() {
  if (!latitude || !longitude) {
    console.error('[NodeJS] Coordenadas nao disponiveis. Nao e possivel buscar o clima.');
    return;
  }

  console.log(`\n[NodeJS] Buscando clima para Lat ${latitude}, Lon ${longitude}...`);
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&lang=pt_br&units=metric`;
    const response = await fetch(url);
    const weatherData = await response.json();

    if (
      weatherData &&
      weatherData.main &&
      weatherData.main.temp !== undefined &&
      weatherData.weather &&
      weatherData.weather.length > 0
    ) {
      const temperature = Math.ceil(weatherData.main.temp);
      const humidity = weatherData.main.humidity;
      let description = weatherData.weather[0].description;

      description = removeAccents(description);
      const formattedLocation = removeAccents(neighborhood || city);

      const message = `C:${formattedLocation};T:${temperature}C;U:Umidade ${humidity}%;CL:${description}\n`;

      console.log('[NodeJS] Preparando para enviar os dados ao Arduino (limpo):', message.trim());

      serialConnection.write(message, (err) => {
        if (err) {
          return console.error('[NodeJS] Erro ao enviar dados para Arduino:', err.message);
        }
        console.log(`[NodeJS] Dados de clima enviados com sucesso! [${new Date().toLocaleString()}]`);
      });
    } else {
      console.error('[NodeJS] Dados inválidos ou incompletos recebidos da API. Resposta da API:', JSON.stringify(weatherData, null, 2));
    }
  } catch (err) {
    console.error('[NodeJS] Erro ao buscar clima na API:', err.message);
  }
}