
document.addEventListener("DOMContentLoaded", function () {
    const token = '295941a3e0a429fb4a159dabfcee87d5c3496ffc'; // 🔐 Replace with your real token
    const apiUrl = 'https://engine.cocomatik.com/api/profile/';
    // const token = localStorage.getItem('authToken')

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
                // Default to "Other" if not male/female
                document.querySelector(`input[name="gender"][value="other"]`).checked = true;
            }

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
                alert('Profile updated successfully!');
                console.log('Updated profile:', data);
            })
            .catch(error => {
                console.error('Update error:', error);
                alert('Failed to update profile');
            });
    });
});
