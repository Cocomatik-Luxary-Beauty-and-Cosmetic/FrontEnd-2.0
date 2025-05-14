try{
    const token = localStorage.getItem('authToken');
    if(!token){
        window.location.href = 'login.html';
    }


document.addEventListener("DOMContentLoaded", function () { // 🔐 Replace with your real token
    const apiUrl = 'https://engine.cocomatik.com/api/profile/';
    

    const form = document.querySelector('.profile-form');

    // --- GET Request: Populate form with existing data ---
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(res => res.json())
        .then(data => {
            document.getElementById('firstName').value = data.first_name || '';
            document.getElementById('lastName').value = data.last_name || '';
            document.getElementById('email').value = data.email || '';
            document.getElementById('phone').value = data.phone || '';
            document.getElementById('age').value = data.age || '';

            if (data.gender === "male" || data.gender === "female") {
                document.querySelector(`input[name="gender"][value="${data.gender}"]`).checked = true;
            } else {
                document.querySelector(`input[name="gender"][value="other"]`).checked = true;
            }
            localStorage.setItem("username", `${data.first_name} ${data.last_name}`);
            localStorage.setItem("gender", data.gender);


        })
        .catch(error => {
            console.error('Error loading profile:', error);
            alert('Could not load profile data');
        });

    // --- PUT Request: Update profile on submit ---
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const body = {
            first_name: document.getElementById('firstName').value || null,
            last_name: document.getElementById('lastName').value || null,
            phone: document.getElementById('phone').value,
            age: parseInt(document.getElementById('age').value),
            gender: document.querySelector('input[name="gender"]:checked').value
        };

        fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to update profile');
                return res.json();
            })
            .then(data => {
                console.log('Updated profile:', data);
                localStorage.setItem("gender",data.gender)
                location.reload();
            })
            .catch(error => {
                console.error('Update error:', error);
                alert('Failed to update profile');
            });
    });
});

} catch (error) {
    console.error('Critical error:', error);
    window.location.href = 'login.html'; // Fallback redirect in case of major errors
}
