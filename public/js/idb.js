// Create variable to hold db connection
let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
    // Save a reference to the database
    const db = event.target.result;
    // Create an object store (table) called `budget_tracker`, set to have an auto incrementing primary key of sorts
    db.createObjectStore('budget_tracker', { autoIncrement: true });
};

// Upon a successful
request.onsuccess = function(event) {
    // When db is successfully created with its object store (from onupgradedneeded event) or simply established a connection, save references to db in global variable
    db = event.target.result;

    // Check if app is online, if yes run uploadBudget() function to send all local db data to api
    if (navigator.onLine) {
        //uploadBudget();
    }
};

request.onerror = function(event) {
    // Log error
    console.log(event.target.errorCode);
};

// Function will be executed if attempt to submit a transaction and there's no internet connection
function saveRecord(record) {
    // Open a new transaction with the database with read and write permissions
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // Access the object store for `new_budget`
    const budgetObjectStore = transaction.objectStore('new_budget');

    // Add record to your store with add method
    budgetObjectStore.add(record);
}