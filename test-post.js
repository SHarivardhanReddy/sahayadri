fetch('http://localhost:5000/api/workers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        name: "Nirmal Das",
        age: 27,
        homeState: "Assam",
        contactNumber: "9000111222",
        healthHistory: "No chronic illness"
    })
})
.then(res => res.json())
.then(data => console.log("Success:", data))
.catch(err => console.error("Error:", err));