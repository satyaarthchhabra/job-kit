const arr = [
  "/company/digia-tech-1/jobs/1150640-software-development-intern-react-react-native-java-script-node-js-flutter",
  "/company/crove/jobs/2010145-software-development-intern",
  "/company/helpen/jobs/1997949-node-js-developer-javascript-typescript",
  "/company/codersarts/jobs/1377429-full-stack-development-mern-stack-internship-6-months",
  "/company/codersarts/jobs/884052-android-app-development-internship",
  "/company/eazypg-1/jobs/1864168-flutter-intern",
  "/company/giva-1/jobs/1778180-software-developer",
  "/company/india-haat/jobs/759194-android-developer-intern",
  "/company/twimbit/jobs/573964-software-development-intern",
  "/company/attentioun1/jobs/2005574-frontend-developer-intern",
  "/company/fenmo/jobs/1988047-mobile-application-developer",
];
const jobIds = arr.map((elem) => {
  return elem.split("/")[4].split("-")[0];
});
console.log(jobIds);
