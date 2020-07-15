import { Firebase } from "pkg/firebase/admin";
import { initializeApp } from "firebase-admin";

//https://console.firebase.google.com/u/0/project/example-f9e11/settings/serviceaccounts
//https://cloud.google.com/docs/authentication/production#auth-cloud-implicit-nodejs
let cert = {
  type: "service_account",
  project_id: "example-f9e11",
  private_key_id: "4d66f15e4cdab3f5652a24ffa094ee2b8c294f5c",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDFq7Lut/ctzodx\nPTvQrdyimJxQtByFC2VKwb2Tu2QrFuoFq6xJp4ers/YT93cmCAC0BDIvOafCsekC\n5PqubLAlPbhQwALcF4PwbOqYE83+0amI2dSOymw8oVEY2XFN56gZKg2S8+8qhd3T\nocN28TflN1aCl8lOk/aa4wiYXnrjMiADaTQ/MdiLVedE/FpbQ8W/7387llECkKvM\njeHh1p9FKnBA98DzKNCwHS/YoEZAsGk3kPzDoWipMsWJdgmWfjv8Czfs4n40FEet\ncT2q0ASZXPrhESiJ/TOaiT/0R8MgicMKfyJvyth6tmKBBqiI2LTSTKudw1Ud+CLH\njYKHDQ8DAgMBAAECggEAQ7C8+Q+Jdye67PXNpnPrUsjU+rP68jqJSNTYoR7yOelC\nYYe824ohpRRe585+AEmMSBkJwG9Lehonk4SrLZDtrwsYM5rVP95TocECguqBR8ov\ndrw1lGJQN2D8nvhTWxzBzUA/3rtnAtZNtNu3zmLjQ7y0BMuKtbxonfiyKE9uYJ9e\nH5DnK+SDgsXp5roseDQbGo9USTloEnBDLVasryifc4n3UsUyVEqEheveZlbu8CMm\n5gNGMjtq7j08w/tSApjUVkcKJ8VcSV0sT5Ld7vOz5P7PqltOasxUm2uIt5mCdfo0\nb3d2qGMcXV6l6O0b2TAh7igJgOZSAiymCUbj8TCwVQKBgQD7WxxivVmg2R0H7ofv\nEmWJMkeai7m5cx6SmiR+s9P9dSCQJTSI+IO3gT+QUPL97wX8T4hsvvOBES7NFXaG\n7BXZPqQegkC3VkIg5xAsP4v64UMQHMpSEL76RziK0aspxxmGsTCxHNkeAZKHqstv\nsLwARllJDpEUpPhTpoVddWKo/QKBgQDJUqmJcj5W1XWCeOiVwn5eg/094ItU1ld2\nQOT7MjFwbKx7loA698QzlFNsr9qfMvaD0i53JTjT6kHu0rtNgqOrE19ZWsJPCL1s\nTwmw3fvUAeJ1305FoJJChbQpuscODzwFghH6lF8PmnQvWB8vtxs89XcWaziJwavH\nDcQvfngX/wKBgFKAck26htuzx8KduYJwEGG63iPM7vX+4i8OZyIrVk6gDkMh4x9+\nKoWl574vw8IznUxWspm3B2f6wtjPzaq1fOpklCvrZuCGcIgqL3XGmeSL4Z49RO8w\nze6KR/XQohTBZBCAwlGv/VfK/lSHa+TKJrsUXCQNovMavuN+CdJGQE7lAoGBAJ2D\nu3n6lKPD52jpyLBDuDOi+WSMZvc9rLitFXskTmIz5M/ddP6uFCh3CL6k6Fxet1lz\n/T7jNI85XdTJtBp0+DFFuvhidlz37ZzsShzD0eCSiOjIiqkXdNfvXIK5zDxH1yJI\nHmD77VR7+COCwwPGM92CAGbeBSJjEU9wierO/I9pAoGBANpry7Ov9L1cTkgPah79\nWNZTukl+iz1uW61PM2J6Z8jrIkYtvfIWwR2gPMkMlVheM4OXHfEAqiCrf+Zsvcoj\nRwOrrLQwQDGP1N9uhHhraV8iSxP6oAgidAJ+2k9b1N8+Hzcin77QavQdEj/7tcIs\nbXDr5Oq2EkZuTnWPvbsKFNkX\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-zx8dx@example-f9e11.iam.gserviceaccount.com",
  client_id: "114018304388592414501",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-zx8dx%40example-f9e11.iam.gserviceaccount.com"
};

export default {
  cert,
  appId: "1:684865417357:web:e4ff28c37e5336548cb2c4",
  apiKey: "AIzaSyAZ_fD4HflKU1rIb5zfi5IZ2_EMJSAT_Tk",
  messagingSenderId: "684865417357", //Cloud Messaging
  measurementId: "G-59RT8HNS31"
};
