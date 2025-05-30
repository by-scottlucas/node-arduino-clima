#include <Wire.h>
#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

String receivedData = "";
bool isCompleteData = false;

String lastCity = "";
String lastTemperature = "";
String lastHumidity = "";
String lastWeather = "";

void setup() {
  Serial.begin(9600);
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Iniciando...");
  lcd.setCursor(0, 1);
  lcd.print("Conectando Node");
  delay(2000);
  lcd.clear();
}

void loop() {
  bool hasNewMessage = false;

  while (Serial.available()) {
    char ch = Serial.read();
    receivedData += ch;

    if (ch == '\n') {
      isCompleteData = true;
      hasNewMessage = true;
      break;
    }
  }

  if (isCompleteData) {
    Serial.print("DEBUG: Recebido RAW: ");
    Serial.println(receivedData);

    if (hasNewMessage) {
      lcd.clear();
      lcd.setCursor(0, 0);
      lcd.print("Atualizando...");
      lcd.setCursor(0, 1);
      lcd.print("Aguarde...");
      delay(2000);
    }

    processWeatherData(receivedData);
    receivedData = "";
    isCompleteData = false;
  }

  if (!hasNewMessage && lastCity.length() > 0) {
    displayCurrentWeather();
    delay(500);
  } else if (lastCity.length() == 0) {
    lcd.setCursor(0, 0);
    lcd.print("NodeJS conectado");
    lcd.setCursor(0, 1);
    lcd.print("Aguardando dados");
  }
}

String extractField(const String &data, const String &key, char delimiter) {
  int keyStart = data.indexOf(key + ":");
  if (keyStart == -1) return "";

  int valueStart = keyStart + key.length() + 1;
  int valueEnd = data.indexOf(delimiter, valueStart);

  if (valueEnd == -1) {
    valueEnd = data.length();
    while (valueEnd > valueStart && (data[valueEnd - 1] == '\n' || data[valueEnd - 1] == '\r' || isWhitespace(data[valueEnd - 1]))) {
      valueEnd--;
    }
  }

  return data.substring(valueStart, valueEnd);
}

bool isWhitespace(char c) {
  return c == ' ' || c == '\t' || c == '\n' || c == '\r';
}

void processWeatherData(const String &data) {
  lastCity = extractField(data, "C", ';');
  lastTemperature = extractField(data, "T", ';');
  lastHumidity = extractField(data, "U", ';');
  lastWeather = extractField(data, "CL", ',');
}

void displayCurrentWeather() {
  lcd.clear();

  if (lastCity.length() > 0) {
    lcd.setCursor(0, 0);
    lcd.print(lastCity);

    lcd.setCursor(0, 1);
    lcd.print(lastTemperature);
    lcd.print(" ");
    lcd.print(lastHumidity);
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Sem dados de");
    lcd.setCursor(0, 1);
    lcd.print("clima ainda.");
  }

  delay(5000);
  lcd.clear();

  if (lastWeather.length() > 0) {
    lcd.setCursor(0, 0);
    lcd.print("Clima:");

    lcd.setCursor(0, 1);
    if (lastWeather.length() > 16) {
      lcd.print(lastWeather.substring(0, 16));
    } else {
      lcd.print(lastWeather);
    }
  } else {
    lcd.setCursor(0, 0);
    lcd.print("Descricao do");
    lcd.setCursor(0, 1);
    lcd.print("clima ausente.");
  }

  delay(5000);
}