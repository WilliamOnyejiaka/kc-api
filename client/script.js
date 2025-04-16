
async function forgotPassword() {
    const email = "williamonyejiaka2021@gmail.com";
    const host = "https://kc-api-nd5n.onrender.com";
    const url = `${host}/api/v1/auth/user/forgot-password/${email}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Success:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Call the function
forgotPassword();