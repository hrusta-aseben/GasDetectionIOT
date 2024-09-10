#include <Arduino.h>
#include <Wire.h>
#if defined(ESP32)
  #include <WiFi.h>
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>

//Provide the token generation process info.
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"

#define WIFI_SSID "Net_551976"
#define WIFI_PASSWORD "adnan2244adnan2244"

#define API_KEY "AIzaSyAhpbWrHq6x1ngXfyaBWb3335P_aV_RQjw"

#define DATABASE_URL "https://hrusta-c816f-default-rtdb.europe-west1.firebasedatabase.app" 

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;

#define mq2Pin A0 
#define ledPin D0 

float sensorValue = 0;
float maxCO;

bool turnOffAlarm = false;

void setup() {
  Serial.begin(9600); 
  pinMode(ledPin, OUTPUT); 

   WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED){
    Serial.print(".");
    delay(2000);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")){
    Serial.println("ok");
    signupOK = true;
  }
  else{
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

}

void loop() {
  if (Firebase.RTDB.getInt(&fbdo, "maxCO"))
  maxCO =  fbdo.floatData();

  if (Firebase.RTDB.getBool(&fbdo, "turnOffAlarm"))
  turnOffAlarm = fbdo.boolData();

  sensorValue = analogRead(mq2Pin); 

  float ppm = calculatePPM(sensorValue);
  float mgPerM3 = convertPPMToMgPerM3(ppm, 28.01);

  Serial.print("CO concentration: ");
  Serial.print(ppm);
  Serial.print(" PPM, ");
  Serial.print(mgPerM3);
  Serial.println(" mg/m³");

  Firebase.RTDB.setInt(&fbdo, "gasConcentrationMgPerM3", mgPerM3);


//SOS i Alarm
if(turnOffAlarm)
{
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, HIGH);
  delay(500);
  digitalWrite(ledPin, LOW);
  delay(500);
  digitalWrite(ledPin, HIGH);
  delay(300);
    digitalWrite(ledPin, LOW);
  delay(300);
    digitalWrite(ledPin, LOW);
  delay(300);
    digitalWrite(ledPin, HIGH);
  delay(300);
    digitalWrite(ledPin, LOW);
  delay(300);
}
  digitalWrite(ledPin, LOW);

  delay(1000); 
}
// if(Firebase.RTDB.getBool(&fbdo, "toggleFan/boolean")==1)
// {
// toggle = fbdo.boolData();
// }

float calculatePPM(int sensorValue) {
  return sensorValue * (1000.0 / 1023.0); 
}

float convertPPMToMgPerM3(float ppm, float molecularWeight) {
  return ppm * (molecularWeight / 24.45);
}
