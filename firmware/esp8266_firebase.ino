// ESP-12E + MCP2515 -> Firebase Realtime Database (replaces the Blynk version)
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <SPI.h>
#include <mcp_can.h>

const char* ssid = "YOUR_WIFI";
const char* pass = "YOUR_PASSWORD";
const String DB = "https://battery-monitoring-syste-2f9c1-default-rtdb.asia-southeast1.firebasedatabase.app";

#define MCP_CS_PIN 4
MCP_CAN CAN(MCP_CS_PIN);
WiFiClientSecure client;
unsigned long lastPoll = 0, lastHist = 0;

bool send(const String& path, const char* body, bool post) {
  HTTPClient http;
  if (!http.begin(client, DB + path)) return false;
  http.addHeader("Content-Type", "application/json");
  int code = post ? http.POST(body) : http.PUT(body);
  http.end();
  return code == 200;
}

void fetchBMSData() {
  byte trig[1] = {0x5A};
  CAN.sendMsgBuf(0x100, 0, 1, trig);
  unsigned long t = millis();
  while (CAN_MSGAVAIL != CAN.checkReceive() && millis() - t < 150) delay(2);
  if (CAN_MSGAVAIL != CAN.checkReceive()) return;

  long unsigned int rxId; unsigned char len = 0, buf[8];
  CAN.readMsgBuf(&rxId, &len, buf);
  if (len < 8) return;

  float voltage = (float)((buf[0] << 8) | buf[1]) * 0.01;
  float current = (float)((int16_t)((buf[2] << 8) | buf[3])) * 0.1;
  float soc = (float)((buf[4] << 8) | buf[5]) * 0.1;
  if (soc > 100) soc *= 0.1;
  float temp = (float)((buf[6] << 8) | buf[7]) * 0.1 - 40;
  if (temp < -35 || temp > 120) temp = 30.0;
  Serial.printf("V: %.2f | SOC: %.1f | T: %.1f | I: %.2f\n", voltage, soc, temp, current);

  if (WiFi.status() != WL_CONNECTED) return;
  char json[160];
  snprintf(json, sizeof(json),
    "{\"voltage\":%.2f,\"current\":%.2f,\"soc\":%.1f,\"temp\":%.1f,\"ts\":{\".sv\":\"timestamp\"}}",
    voltage, current, soc, temp);
  send("/bms/live.json", json, false);          // every 2 s, overwrites
  if (millis() - lastHist > 10000) {            // every 10 s, adds a history record
    lastHist = millis();
    send("/bms/history.json", json, true);
  }
}

void setup() {
  Serial.begin(115200);
  SPI.begin(); SPI.setFrequency(4000000);
  if (CAN.begin(MCP_ANY, CAN_500KBPS, MCP_8MHZ) != CAN_OK &&
      CAN.begin(MCP_ANY, CAN_500KBPS, MCP_16MHZ) != CAN_OK) Serial.println("CAN init failed");
  CAN.setMode(MCP_NORMAL);
  WiFi.begin(ssid, pass);
  client.setInsecure();
  client.setBufferSizes(1024, 512);
}

void loop() {
  if (millis() - lastPoll >= 2000) { lastPoll = millis(); fetchBMSData(); }
}
