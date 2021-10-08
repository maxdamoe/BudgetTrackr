let db;
const request = indexedDB.open("budgetracker", 1);

request.onupgradeneeded = function(event) {
   const db = event.target.result;
   db.createObjectStore("budgetracker", { autoIncrement: true });
 };
 
 request.onsuccess = function(event) {
   db = event.target.result;
    if (navigator.onLine) {
     checkDatabase();
   }
 };
 
 request.onerror = function(event) {
   console.log(event.target.errorCode);
 };
 
 function saveRecord(record) {
   const transaction = db.transaction(["budgetracker"], "readwrite");
 
   const objectStore = transaction.objectStore("budgetracker");
   objectStore.add(record);
 }
 
 function checkDatabase() {
   const transaction = db.transaction(["budgetracker"], "readwrite");
   const objectStore = transaction.objectStore("budgetracker");
   const getAll = objectStore.getAll();
 
   getAll.onsuccess = function() {
     if (getAll.result.length > 0) {
       fetch("/api/transaction/bulk", {
         method: "POST",
         body: JSON.stringify(getAll.result),
         headers: {
           Accept: "application/json, text/plain, */*",
           "Content-Type": "application/json"
         }
       })
       .then(response => response.json())
       .then(() => {
         const transaction = db.transaction(["budgetracker"], "readwrite");
          const objectStore = transaction.objectStore("budgetracker");
          objectStore.clear();
       });
     }
   };
 }
 
 window.addEventListener("online", checkDatabase);
