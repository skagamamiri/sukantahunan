async function checkUser() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        window.location.href = "login.html";

        return;
    }


    const {
        data: profile,
        error
    } = await supabaseClient

        .from("profiles")

        .select("*")

        .eq("id", user.id)

        .single();


    if (error) {

        console.error(error);

        return;
    }


    document.getElementById("userName")
        .textContent =
        profile.full_name || "Admin";


    loadDashboard();

}


async function loadDashboard() {

    // ACTIVE YEAR

    const {
        data: years,
        error: yearError
    } = await supabaseClient

        .from("years")

        .select("*")

        .eq("is_active", true)

        .limit(1);


    if (yearError) {

        console.error(yearError);

        return;
    }


    if (!years || years.length === 0) {

        document.getElementById("activeYear")
            .textContent =
            "Tiada tahun aktif";

        return;
    }


    const year = years[0];


    document.getElementById("activeYear")
        .textContent =
        year.name || year.year;


    // HOUSES

    const {
        data: houses
    } = await supabaseClient

        .from("houses")

        .select("*")

        .eq("year_id", year.id)

        .eq("is_active", true);


    document.getElementById("houseCount")
        .textContent =
        houses ? houses.length : 0;


    // STUDENTS

    const {
        count: studentCount
    } = await supabaseClient

        .from("students")

        .select("*", {
            count: "exact",
            head: true
        })

        .eq("year_id", year.id)

        .eq("is_active", true);


    document.getElementById("studentCount")
        .textContent =
        studentCount || 0;


    // EVENTS

    const {
        count: eventCount
    } = await supabaseClient

        .from("events")

        .select("*", {
            count: "exact",
            head: true
        })

        .eq("year_id", year.id)

        .eq("is_active", true);


    document.getElementById("eventCount")
        .textContent =
        eventCount || 0;


    // SCOREBOARD

    loadScoreboard(year.id);

}


async function loadScoreboard(yearId) {

    const {
        data,
        error
    } = await supabaseClient

        .from("house_scores")

        .select(`
            *,
            houses (
                name,
                color,
                code
            )
        `)

        .eq("year_id", yearId)

        .order("ranking", {
            ascending: true,
            nullsFirst: false
        });


    if (error) {

        console.error(error);

        document.getElementById("scoreboard")
            .innerHTML =
            "<p>Gagal memuatkan markah.</p>";

        return;
    }


    const scoreboard =
        document.getElementById("scoreboard");


    if (!data || data.length === 0) {

        scoreboard.innerHTML = `
            <div class="empty">
                Belum ada markah direkodkan.
            </div>
        `;

        return;
    }


    scoreboard.innerHTML = "";


    data.forEach((item, index) => {

        const house =
            item.houses;


        const ranking =
            item.ranking || index + 1;


        let medal = "";

        if (ranking === 1)
            medal = "🥇";

        else if (ranking === 2)
            medal = "🥈";

        else if (ranking === 3)
            medal = "🥉";

        else
            medal = ranking;


        const row =
            document.createElement("div");


        row.className =
            "score-row";


        row.innerHTML = `

            <div class="rank">
                ${medal}
            </div>

            <div
                class="house-color"
                style="
                    background:${house?.color || '#2563eb'}
                "
            ></div>

            <div class="house-info">

                <strong>
                    ${house?.name || "Rumah"}
                </strong>

                <small>
                    ${house?.code || ""}
                </small>

            </div>

            <div class="score">

                <strong>
                    ${Number(
                        item.total_points || 0
                    ).toFixed(0)}
                </strong>

                <span>
                    mata
                </span>

            </div>

        `;


        scoreboard.appendChild(row);

    });

}


async function logout() {

    await supabaseClient.auth.signOut();

    window.location.href =
        "login.html";

}


document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        logout
    );


checkUser();
