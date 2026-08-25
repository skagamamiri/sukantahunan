let activeYear = null;
let houses = [];
let students = [];


// ===============================
// CHECK USER
// ===============================

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


    await loadData();

}


// ===============================
// LOAD DATA
// ===============================

async function loadData() {

    await loadYear();

    if (!activeYear) return;

    await loadHouses();

    await loadStudents();

    populateFilters();

    renderStudents();

}


// ===============================
// LOAD YEAR
// ===============================

async function loadYear() {

    const {
        data,
        error
    } = await supabaseClient

        .from("years")

        .select("*")

        .eq("is_active", true)

        .limit(1);


    if (error) {

        console.error(error);

        return;
    }


    if (!data || data.length === 0) {

        document.getElementById("activeYear")
            .textContent =
            "Tiada tahun aktif";

        return;
    }


    activeYear = data[0];


    document.getElementById("activeYear")
        .textContent =
        activeYear.name ||
        activeYear.year ||
        "Tahun Aktif";

}


// ===============================
// LOAD HOUSES
// ===============================

async function loadHouses() {

    const {
        data,
        error
    } = await supabaseClient

        .from("houses")

        .select("*")

        .eq("year_id", activeYear.id)

        .eq("is_active", true)

        .order("name");


    if (error) {

        console.error(error);

        return;
    }


    houses = data || [];


    const select =
        document.getElementById("studentHouse");


    select.innerHTML = `
        <option value="">
            Pilih Rumah Sukan
        </option>
    `;


    houses.forEach(house => {

        select.innerHTML += `

            <option value="${house.id}">

                ${house.name}

            </option>

        `;

    });

}


// ===============================
// LOAD STUDENTS
// ===============================

async function loadStudents() {

    const {
        data,
        error
    } = await supabaseClient

        .from("students")

        .select("*")

        .eq("year_id", activeYear.id)

        .order("name");


    if (error) {

        console.error(error);

        document.getElementById(
            "studentTableBody"
        ).innerHTML = `

            <tr>

                <td colspan="7"
                    class="empty">

                    Gagal mendapatkan data murid.

                </td>

            </tr>

        `;

        return;
    }


    students = data || [];

}


// ===============================
// FILTER
// ===============================

function populateFilters() {

    const houseFilter =
        document.getElementById(
            "houseFilter"
        );


    houses.forEach(house => {

        houseFilter.innerHTML += `

            <option value="${house.id}">

                ${house.name}

            </option>

        `;

    });


    const classFilter =
        document.getElementById(
            "classFilter"
        );


    const classes = [
        ...new Set(
            students
                .map(s =>
                    s.class_name ||
                    s.class ||
                    s.kelas
                )
                .filter(Boolean)
        )
    ].sort();


    classes.forEach(cls => {

        classFilter.innerHTML += `

            <option value="${cls}">

                ${cls}

            </option>

        `;

    });

}


// ===============================
// RENDER
// ===============================

function renderStudents() {

    const search =
        document.getElementById(
            "searchInput"
        ).value
        .toLowerCase()
        .trim();


    const house =
        document.getElementById(
            "houseFilter"
        ).value;


    const cls =
        document.getElementById(
            "classFilter"
        ).value;


    const filtered =
        students.filter(student => {

            const name =
                String(
                    student.name ||
                    student.full_name ||
                    student.student_name ||
                    ""
                ).toLowerCase();


            const ic =
                String(
                    student.ic ||
                    student.ic_number ||
                    student.no_kp ||
                    student.ic_no ||
                    ""
                ).toLowerCase();


            const studentClass =
                student.class_name ||
                student.class ||
                student.kelas ||
                "";


            const matchSearch =
                !search ||
                name.includes(search) ||
                ic.includes(search);


            const matchHouse =
                !house ||
                student.house_id === house;


            const matchClass =
                !cls ||
                studentClass === cls;


            return (
                matchSearch &&
                matchHouse &&
                matchClass
            );

        });


    document.getElementById(
        "studentCountDisplay"
    ).textContent =
        `${filtered.length} murid dipaparkan`;


    const tbody =
        document.getElementById(
            "studentTableBody"
        );


    if (filtered.length === 0) {

        tbody.innerHTML = `

            <tr>

                <td colspan="7"
                    class="empty">

                    Tiada murid dijumpai.

                </td>

            </tr>

        `;

        return;
    }


    tbody.innerHTML = "";


    filtered.forEach(
        (student, index) => {

            const house =
                houses.find(
                    h =>
                    h.id === student.house_id
                );


            const name =
                student.name ||
                student.full_name ||
                student.student_name ||
                "-";


            const ic =
                student.ic ||
                student.ic_number ||
                student.no_kp ||
                student.ic_no ||
                "-";


            const cls =
                student.class_name ||
                student.class ||
                student.kelas ||
                "-";


            const active =
                student.is_active !== false;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(name)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(ic)}
                </td>

                <td>
                    ${escapeHTML(cls)}
                </td>

                <td>

                    <span
                        class="house-badge"
                        style="
                            border-left:
                            5px solid
                            ${house?.color || "#2563eb"}
                        "
                    >

                        ${escapeHTML(
                            house?.name || "-"
                        )}

                    </span>

                </td>

                <td>

                    <span
                        class="status-badge
                        ${active
                            ? "active"
                            : "inactive"}"
                    >

                        ${active
                            ? "Aktif"
                            : "Tidak Aktif"}

                    </span>

                </td>

                <td>

                    <button
                        class="action-button"
                        onclick="editStudent('${student.id}')">

                        ✏️

                    </button>

                    <button
                        class="action-button danger"
                        onclick="toggleStudent('${student.id}')">

                        ${active
                            ? "🚫"
                            : "✅"}

                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}


// ===============================
// SEARCH EVENTS
// ===============================

document
    .getElementById("searchInput")
    .addEventListener(
        "input",
        renderStudents
    );


document
    .getElementById("houseFilter")
    .addEventListener(
        "change",
        renderStudents
    );


document
    .getElementById("classFilter")
    .addEventListener(
        "change",
        renderStudents
    );


// ===============================
// OPEN FORM
// ===============================

function openStudentForm() {

    document.getElementById(
        "studentModal"
    ).classList.add("show");


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Tambah Murid";


    document.getElementById(
        "studentForm"
    ).reset();


    document.getElementById(
        "studentId"
    ).value = "";

}


// ===============================
// CLOSE FORM
// ===============================

function closeStudentForm() {

    document.getElementById(
        "studentModal"
    ).classList.remove("show");

}


// ===============================
// EDIT
// ===============================

function editStudent(id) {

    const student =
        students.find(
            s => s.id === id
        );


    if (!student) return;


    document.getElementById(
        "studentModal"
    ).classList.add("show");


    document.getElementById(
        "modalTitle"
    ).textContent =
        "Edit Murid";


    document.getElementById(
        "studentId"
    ).value =
        student.id;


    document.getElementById(
        "studentName"
    ).value =
        student.name ||
        student.full_name ||
        student.student_name ||
        "";


    document.getElementById(
        "studentIC"
    ).value =
        student.ic ||
        student.ic_number ||
        student.no_kp ||
        student.ic_no ||
        "";


    document.getElementById(
        "studentClass"
    ).value =
        student.class_name ||
        student.class ||
        student.kelas ||
        "";


    document.getElementById(
        "studentHouse"
    ).value =
        student.house_id || "";

}


// ===============================
// SAVE
// ===============================

document
    .getElementById("studentForm")
    .addEventListener(
        "submit",
        saveStudent
    );


async function saveStudent(event) {

    event.preventDefault();

    const id =
        document.getElementById("studentId").value;

    const name =
        document.getElementById("studentName")
        .value.trim();

    const identificationNo =
        document.getElementById("studentIC")
        .value.trim();

    const className =
        document.getElementById("studentClass")
        .value.trim();

    const houseId =
        document.getElementById("studentHouse")
        .value;


    if (!name) {

        alert("Sila masukkan nama murid.");

        return;
    }


    if (!houseId) {

        alert("Sila pilih rumah sukan.");

        return;
    }


    // ==========================
    // EDIT MURID
    // ==========================

    if (id) {

        const {
            error
        } = await supabaseClient

            .from("students")

            .update({

                name: name,

                identification_no:
                    identificationNo || null,

                class_name:
                    className || null,

                house_id:
                    houseId,

                updated_at:
                    new Date().toISOString()

            })

            .eq("id", id);


        if (error) {

            console.error(error);

            alert(
                "Gagal mengemaskini murid:\n\n" +
                error.message
            );

            return;
        }


        alert("Maklumat murid berjaya dikemaskini.");

    }


    // ==========================
    // TAMBAH MURID
    // ==========================

    else {

        const newStudent = {

            id: crypto.randomUUID(),

            year_id:
                activeYear.id,

            house_id:
                houseId,

            category_id:
                null,

            student_code:
                null,

            name:
                name,

            identification_no:
                identificationNo || null,

            gender:
                null,

            school_year:
                null,

            class_name:
                className || null,

            is_active:
                true

        };


        const {
            error
        } = await supabaseClient

            .from("students")

            .insert(newStudent);


        if (error) {

            console.error(error);

            alert(
                "Gagal menambah murid:\n\n" +
                error.message
            );

            return;
        }


        alert("Murid berjaya ditambah.");

    }


    closeStudentForm();


    await loadStudents();


    renderStudents();

}


// ===============================
// TOGGLE STATUS
// ===============================

async function toggleStudent(id) {

    const student =
        students.find(
            s => s.id === id
        );


    if (!student) return;


    const newStatus =
        student.is_active === false;


    const confirmed =
        confirm(
            newStatus
                ? "Aktifkan murid ini?"
                : "Nyahaktifkan murid ini?"
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient

        .from("students")

        .update({
            is_active: newStatus
        })

        .eq("id", id);


    if (error) {

        console.error(error);

        alert(
            "Gagal mengubah status murid."
        );

        return;
    }


    await loadStudents();

    renderStudents();

}


// ===============================
// LOGOUT
// ===============================

document
    .getElementById("logoutButton")
    .addEventListener(
        "click",
        async () => {

            await supabaseClient
                .auth
                .signOut();

            window.location.href =
                "login.html";

        }
    );


// ===============================
// ESCAPE HTML
// ===============================

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ===============================
// START
// ===============================

checkUser();
