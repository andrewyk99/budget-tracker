// Create variable to hold db connection
let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // Save a reference to the database
    const db = event.target.result;
    // Create an object store (table) called `budget_tracker`, set to have an auto incrementing primary key of sorts
    db.createObjectStore('new_budget', { autoIncrement: true });
};

// Upon a successful
request.onsuccess = function(event) {
    // When db is successfully created with its object store (from onupgradedneeded event) or simply established a connection, save references to db in global variable
    db = event.target.result;

    // Check if app is online, if yes run uploadTransaction() function to send all local db data to api
    if (navigator.onLine) {
        //uploadTransaction();
    }
};

request.onerror = function(event) {
    // Log error
    console.log(event.target.errorCode);
};

// Function will be executed if attempt to submit a transaction and there's no internet connection
function saveRecord(record) {
    console.log(record);
    // Open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // Access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // Add record to your store with add method
    budgetObjectStore.add(record);
}

function uploadBudget() {
    // Open a transaction on your db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // Access your object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // Get all records from store and set a variable
    const getAll = budgetObjectStore.getAll();

    // Upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
        // If there was data in indexedDB's store, send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    // Open one more transaction
                    const transaction = db.transaction(['new_budget'], 'readwrite');
                    // Access the new_budget object store
                    const budgetObjectStore = transaction.objectStore('new_budget');
                    // Clear all items in your store
                    budgetObjectStore.clear();

                    alert('All transactions have been submitted!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
}

// Listen for the application to come back online
window.addEventListener('online', uploadBudget);