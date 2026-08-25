const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    loginMessage.textContent = "Sedang log masuk...";

    loginMessage.className = "message";

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {

        console.error(error);

        loginMessage.textContent =
            "Email atau kata laluan tidak betul.";

        loginMessage.className =
            "message error";

        return;
    }

    loginMessage.textContent =
        "Login berjaya. Membuka dashboard...";

    loginMessage.className =
        "message success";

    window.location.href = "dashboard.html";

});
