let db;
const request = indexedDB.open('tracker', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result; // save ref to db
    db.createObjectStore('budget', { autoIncrement: true }); // create object store table called budget 
};

request.onsuccess = function(event) {
    db = event.target.result;
    if(navigator.onLine) {
        uploadData();
        console.log('it is working as should!!!')
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction('budget', 'readwrite');
    const budgetObjectStore = transaction.objectStore('budget');
    
    budgetObjectStore.add(record);
};

function uploadData() {
    const transaction = db.transaction('budget', 'readwrite');
    const budgetObjectStore = transaction.objectStore('budget');
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        fetch('/api/transaction/bulk', {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*', 
                'Content-type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(() => {
            const transaction = db.transaction('budget', 'readwrite');
            const budgetObjectStore = transaction.objectStore('budget');
            budgetObjectStore.clear();
        })
        .catch(err => {console.log(err)})
    }
};

window.addEventListener('online', uploadData);