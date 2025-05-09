const scheduleBody = document.getElementById("schedule-body");
const weekRangeLabel = document.querySelector(".week-range");
const prevWeekBtn = document.querySelector(".prev-week");
const nextWeekBtn = document.querySelector(".next-week");

const nameInput = document.getElementById("name-input");
const telInput = document.getElementById("tel-input");
const dateInput = document.getElementById("date-input");
const timeInput = document.getElementById("time-input");
const agendBtn = document.querySelector(".agend-btn");
const profissionalSelect = document.getElementById("profissional");

let currentWeekStart = getMonday(new Date());
profissionalSelect.addEventListener("change", () => {
  renderWeek(currentWeekStart, profissionalSelect.value);
});

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateBR(date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function generateTimeSlots(start = "08:00", end = "18:00") {
  const slots = [];
  let [hour, minute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  while (hour < endHour || (hour === endHour && minute < endMinute)) {
    slots.push(
      `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
    );
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour++;
    }
  }
  return slots;
}

function getAppointments(profissional = null) {
  const allAppointments = JSON.parse(
    localStorage.getItem("appointments") || "{}"
  );
  if (!profissional) return allAppointments;

  const filtered = {};
  for (const date in allAppointments) {
    for (const time in allAppointments[date]) {
      if (allAppointments[date][time].profissional === profissional) {
        if (!filtered[date]) filtered[date] = {};
        filtered[date][time] = allAppointments[date][time];
      }
    }
  }
  return filtered;
}

function saveAppointment(date, time, name, tel, profissional) {
  const appointments = getAppointments();
  const dateKey = formatDate(new Date(date));
  if (!appointments[date]) appointments[date] = {};
  appointments[date][time] = { name, tel, profissional };
  localStorage.setItem("appointments", JSON.stringify(appointments));
}

function renderWeek(startDate, profissional = null) {
  const appointments = getAppointments(profissional);
  const tbody = document.getElementById("schedule-body");
  tbody.innerHTML = "";

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateKey = formatDate(currentDate);
    const weekday = currentDate.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

    const timeSlots = generateTimeSlots();

    const slotsHTML = timeSlots
      .map((time) => {
        const booked = appointments[dateKey]?.[time];
        const bgColor = booked ? "#dc3545" : "#28a745";

        return `
        <span class="time-slot"
          data-date="${dateKey}"
          data-time="${time}"
          style="display:inline-block; margin:3px; padding:5px 8px;
                 border-radius:5px; font-size:15px; font-weight: bold;
                 cursor: ${booked ? "default" : "pointer"};
                 background-color: ${bgColor}; color: white;">
          ${time}
        </span>`;
      })
      .join("");

    tbody.innerHTML += `
      <tr>
        <td>${weekday}</td>
        <td>${slotsHTML}</td>
      </tr>`;
  }

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  const rangeLabel = `${startDate.toLocaleDateString(
    "pt-BR"
  )} - ${endDate.toLocaleDateString("pt-BR")}`;
}

agendBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const tel = telInput.value.trim();
  const date = dateInput.value;
  const time = timeInput.value;
  const profissional = profissionalSelect.value;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!name || !tel || !date || !time) {
    alert("Preencha todos os campos!");
    return;
  }

  const profissionalAppointments = getAppointments(profissional);
  const dateKey = formatDate(selectedDate);

  if (profissionalAppointments[dateKey]?.[time]) {
    alert("Este horário já está agendado para este profissional!");
    return;
  }

  if (saveAppointment(date, time, name, tel, profissional)) {
    alert("Agendado com sucesso!");
    renderWeek(currentWeekStart, profissional);
  }
  const HORARIO_COMERCIAL = {
    inicio: "08:00",
    fim: "18:00",
  };
  function isHorarioValido(time) {
    const [horaSelecionada, minutoSelecionado] = time.split(":").map(Number);
    const [horaInicio, minutoInicio] = HORARIO_COMERCIAL.inicio
      .split(":")
      .map(Number);
    const [horaFim, minutoFim] = HORARIO_COMERCIAL.fim.split(":").map(Number);

    const totalMinutosSelecionado = horaSelecionada * 60 + minutoSelecionado;
    const totalMinutosInicio = horaInicio * 60 + minutoInicio;
    const totalMinutosFim = horaFim * 60 + minutoFim;

    return (
      totalMinutosSelecionado >= totalMinutosInicio &&
      totalMinutosSelecionado <= totalMinutosFim
    );
  }

  if (!name || !tel || !date || !time) {
    alert("Preencha todos os campos!");
    return;
  }

  if (!isHorarioValido(time)) {
    alert(
      `Horário inválido! O salão funciona das ${HORARIO_COMERCIAL.inicio} às ${HORARIO_COMERCIAL.fim}`
    );
    return;
  } else if (profissionalAppointments[dateKey]?.[time]) {
    alert("Este horário já está agendado para este profissional!");
    return;
  }

  saveAppointment(date, time, name, tel, profissional);
  alert("Agendado com sucesso!");
  renderWeek(currentWeekStart, profissional);
});

function isDiaUtil(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

prevWeekBtn.addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() - 7);
  renderWeek(currentWeekStart, profissionalSelect.value);
});

nextWeekBtn.addEventListener("click", () => {
  currentWeekStart.setDate(currentWeekStart.getDate() + 7);
  renderWeek(currentWeekStart, profissionalSelect.value);
});

// Inicialização
renderWeek(currentWeekStart, profissionalSelect.value);

const modalDate = document.getElementById("modal-date");
const modalTime = document.getElementById("modal-time");
const modalName = document.getElementById("modal-name");
const modalTel = document.getElementById("modal-tel");

const modal = new bootstrap.Modal(document.getElementById("appointmentModal"));

document.addEventListener("click", (e) => {
  const el = e.target.closest(".time-slot");
  if (!el) return;

  const date = el.dataset.date;
  const time = el.dataset.time;
  const appointments = getAppointments();
  const agendamento = appointments[date]?.[time];
  const USUARIO_VALIDO = "admin";
  const SENHA_VALIDA = "1234";

  if (agendamento) {
    const usuario = prompt("Digite seu usuário (login):");
    if (usuario === null) return;

    const senha = prompt("Digite sua senha:");
    if (senha === null) return;

    if (usuario === USUARIO_VALIDO && senha === SENHA_VALIDA) {
      modalDate.textContent = date;
      modalTime.textContent = time;
      modalName.textContent = agendamento.name;
      modalTel.textContent = agendamento.tel;
      modal.show();
    } else {
      alert("Credenciais incorretas!");
    }
  } else {
    dateInput.value = date;
    timeInput.value = time;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const menuToSection = {
    "sobre-nav": "mainSlider",
    "servicos-mainListDiv": "corte",
    "time-nav": "john",
    "agendar-nav": "agendar",
    botaobtn: "agendar",
  };

  Object.keys(menuToSection).forEach((menuId) => {
    const menuItem = document.getElementById(menuId);
    if (menuItem) {
      menuItem.addEventListener("click", function (e) {
        e.preventDefault();

        const sectionId = menuToSection[menuId];
        const targetSection = document.getElementById(sectionId);

        if (targetSection) {
          const navbarHeight = document.querySelector(".nav").offsetHeight;
          const targetPosition =
            targetSection.getBoundingClientRect().top +
            window.pageYOffset -
            navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });

          document.querySelectorAll(".nav-link").forEach((item) => {
            item.classList.remove("active");
          });
          this.classList.add("active");
        }
      });
    }
  });

  Object.entries(menuToSection).forEach(([menuId, sectionId]) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const navbarHeight = document.querySelector(".navbar").offsetHeight;

      if (
        scrollPosition >= sectionTop - navbarHeight - 50 &&
        scrollPosition < sectionTop + sectionHeight - navbarHeight - 50
      ) {
        document.querySelectorAll(".nav-link").forEach((item) => {
          item.classList.remove("active");
        });

        const menuItem = document.getElementById(menuId);
        if (menuItem) menuItem.classList.add("active");
      }
    }
  });
});

function checkFadeIn() {
  const elements = document.querySelectorAll(".fade-in");
  const windowHeight = window.innerHeight;

  elements.forEach((el) => {
    const elementTop = el.getBoundingClientRect().top;

    if (elementTop < windowHeight - 100) {
      el.classList.add("show");
    }
  });
}

window.addEventListener("scroll", checkFadeIn);
window.addEventListener("load", checkFadeIn);
window.addEventListener("scroll", checkFadeInBySection);
window.addEventListener("load", checkFadeInBySection);

window.addEventListener("DOMContentLoaded", function () {
  const telInput = document.getElementById("tel-input");
  Inputmask({ mask: "(99) 99999-9999" }).mask(telInput);
});

document.addEventListener("DOMContentLoaded", function () {
  const carouselItems = document.querySelectorAll("#mainSlider .carousel-item");

  function updateBackgroundImages() {
    const isMobile = window.innerWidth <= 768;

    carouselItems.forEach((item, index) => {
      const img = item.querySelector("img");
      const imageNumber = index + 5;

      img.classList.remove("desktop-bg", "mobile-bg");

      if (isMobile) {
        img.src = `imagens/barbeariamobile${imageNumber}-mobile.jpg`;
        img.classList.add("mobile-bg");
      } else {
        img.src = `imagens/desktop/barbearia${imageNumber}.jpg`;
        img.classList.add("desktop-bg");
      }
    });
  }

  window.addEventListener("load", updateBackgroundImages);
  window.addEventListener("resize", updateBackgroundImages);

  const myCarousel = document.querySelector("#mainSlider");
  myCarousel.addEventListener("slid.bs.carousel", updateBackgroundImages);
});

document.querySelectorAll(".navlinks a").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 70,
        behavior: "smooth",
      });
    }
  });
});

$(".navTrigger").click(function () {
  $(this).toggleClass("active");
  console.log("Clicked menu");
  $("#mainListDiv").toggleClass("show_list");
  $("#mainListDiv").fadeIn();
});

$(window).scroll(function () {
  if ($(document).scrollTop() > 50) {
    $(".nav").addClass("affix");
    console.log("OK");
  } else {
    $(".nav").removeClass("affix");
  }
});
