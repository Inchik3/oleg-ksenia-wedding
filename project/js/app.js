(function () {
  const config = window.weddingConfig;
  const audio = document.getElementById("weddingMusic");
  const musicBtn = document.getElementById("musicBtn");
  const musicHint = document.getElementById("musicHint");
  const musicControl = document.getElementById("musicControl");
  const envelope = document.getElementById("envelope");
  const nav = document.getElementById("siteNav");
  const modal = document.getElementById("modal");
  const modalCard = document.getElementById("modalCard");
  const modalBody = document.getElementById("modalBody");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  let phase = "sealed";
  let musicOn = false;
  let currentModal = null;

  function lockScroll() {
    const locked = phase !== "open" || currentModal !== null || !lightbox.classList.contains("is-hidden");
    document.body.classList.toggle("scroll-lock", locked);
  }

  async function playMusic() {
    if (!audio) return;
    audio.volume = 0.45;
    try {
      await audio.play();
      musicOn = true;
      musicBtn.classList.add("is-on");
      musicControl.classList.add("is-on");
      musicBtn.setAttribute("aria-pressed", "true");
      musicBtn.setAttribute("aria-label", "Выключить музыку");
    } catch {
      musicOn = false;
    }
  }

  async function toggleMusic() {
    if (!audio) return;
    if (audio.paused) {
      await playMusic();
    } else {
      audio.pause();
      musicOn = false;
      musicBtn.classList.remove("is-on");
      musicControl.classList.remove("is-on");
      musicBtn.setAttribute("aria-pressed", "false");
      musicBtn.setAttribute("aria-label", "Включить музыку");
    }
  }

  function openEnvelope() {
    if (phase !== "sealed") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    phase = "opening";
    envelope.classList.add("is-opening");
    void playMusic();
    window.setTimeout(
      () => {
        phase = "open";
        envelope.classList.add("is-hidden");
        nav.classList.remove("is-hidden");
        lockScroll();
      },
      reduce ? 0 : 1200,
    );
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function tickCountdown() {
    const target = new Date(config.wedding.countdownTarget).getTime();
    const diff = Math.max(0, target - Date.now());
    daysEl.textContent = String(Math.floor(diff / 86_400_000));
    hoursEl.textContent = pad(Math.floor(diff / 3_600_000) % 24);
    minutesEl.textContent = pad(Math.floor(diff / 60_000) % 60);
    secondsEl.textContent = pad(Math.floor(diff / 1000) % 60);
  }

  function closeModal() {
    currentModal = null;
    modal.classList.add("is-hidden");
    modalBody.innerHTML = "";
    lockScroll();
  }

  function closeLightbox() {
    lightbox.classList.add("is-hidden");
    lightboxImg.removeAttribute("src");
    lockScroll();
  }

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.remove("is-hidden");
    lockScroll();
    document.getElementById("lightboxClose").focus();
  }

  function inviteHtml() {
    return `
      <p class="script-title">Дорогие наши!</p>
      ${config.invitation.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      <p class="signature">С любовью, ${config.couple.groomName} и ${config.couple.brideName}</p>
    `;
  }

  function programHtml() {
    return `
      <p class="kicker">Программа дня</p>
      <h2>В этот день</h2>
      <div class="program-list">
        ${config.schedule
          .map(
            (item) => `
          <article class="program-item">
            <time>${item.time}</time>
            <div>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </div>
          </article>`,
          )
          .join("")}
      </div>
    `;
  }

  function wishesHtml() {
    return `
      <p class="kicker">Наши пожелания для гостей</p>
      <h2>Для вашего комфорта</h2>
      <div class="wishes-list">
        ${config.wishes.map((paragraph) => `<p>${paragraph}</p>`).join("")}
      </div>
    `;
  }

  function galleryHtml() {
    return `
      <p class="kicker">Галерея</p>
      <h2>Наши моменты</h2>
      <div class="gallery-grid">
        ${config.gallery
          .map(
            (photo) => `
          <button type="button" data-lightbox="${photo.src}">
            <img src="${photo.src}" alt="${photo.alt}" />
          </button>`,
          )
          .join("")}
      </div>
    `;
  }

  function rsvpHtml() {
    const attendance = config.rsvp.attendanceOptions
      .map(
        (option) => `
        <label class="choice">
          <input type="radio" name="attendance" value="${option.value}" />
          <span>${option.label}</span>
        </label>`,
      )
      .join("");

    const drinks = config.rsvp.drinks
      .map(
        (drink) => `
        <label class="choice">
          <input type="checkbox" name="drinks" value="${drink.value}" />
          <span>${drink.label}</span>
        </label>`,
      )
      .join("");

    return `
      <p class="kicker">${config.rsvp.title}</p>
      <h2>Подтвердите присутствие</h2>
      <p>${config.rsvp.deadlineText}</p>
      <form class="rsvp-form" id="rsvpForm" novalidate>
        <label class="field-label" for="guestName">Имя и фамилия</label>
        <input id="guestName" name="fullName" type="text" autocomplete="name" placeholder="Например: Иван Иванов" />
        <p class="field-error" id="nameError"></p>

        <fieldset>
          <legend class="field-label">Сможете ли присутствовать?</legend>
          <div class="choice-list">${attendance}</div>
          <p class="field-error" id="attendanceError"></p>
        </fieldset>

        <fieldset id="drinksPanel">
          <legend class="field-label">${config.rsvp.drinksQuestion}</legend>
          <p class="hint">Можно выбрать несколько вариантов</p>
          <div class="drink-grid">${drinks}</div>
          <p class="field-error" id="drinksError"></p>
        </fieldset>

        <label class="field-label" for="guestComment">Комментарий</label>
        <textarea id="guestComment" name="comment" rows="4" placeholder="Комментарий или пожелание"></textarea>
        <button class="submit" type="submit" id="rsvpSubmit">${config.rsvp.submitButtonText}</button>
        <p class="form-status" id="rsvpStatus" role="status"></p>
      </form>
    `;
  }

  function bindRsvp() {
    const form = document.getElementById("rsvpForm");
    const drinksPanel = document.getElementById("drinksPanel");
    const status = document.getElementById("rsvpStatus");
    const submit = document.getElementById("rsvpSubmit");

    form.addEventListener("change", (event) => {
      if (event.target.name === "attendance") {
        const declined = event.target.value === "declined";
        drinksPanel.classList.toggle("is-hidden", declined);
        if (declined) {
          form.querySelectorAll('input[name="drinks"]').forEach((input) => {
            input.checked = false;
          });
        }
      }

      if (event.target.name === "drinks") {
        const none = form.querySelector('input[name="drinks"][value="none"]');
        if (event.target.value === "none" && none.checked) {
          form.querySelectorAll('input[name="drinks"]').forEach((input) => {
            if (input.value !== "none") input.checked = false;
          });
        } else if (event.target.value !== "none" && event.target.checked && none) {
          none.checked = false;
        }
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      document.getElementById("nameError").textContent = "";
      document.getElementById("attendanceError").textContent = "";
      document.getElementById("drinksError").textContent = "";
      status.textContent = "";
      status.className = "form-status";

      const fullName = form.fullName.value.trim();
      const attendance = form.querySelector('input[name="attendance"]:checked')?.value || "";
      const selectedDrinks = [...form.querySelectorAll('input[name="drinks"]:checked')].map((input) => input.value);
      const comment = form.comment.value.trim();

      let invalid = false;
      if (!fullName) {
        document.getElementById("nameError").textContent = "Пожалуйста, укажите имя и фамилию.";
        invalid = true;
      }
      if (!attendance) {
        document.getElementById("attendanceError").textContent = "Пожалуйста, выберите вариант ответа.";
        invalid = true;
      }
      if (attendance === "attending" && selectedDrinks.length === 0) {
        document.getElementById("drinksError").textContent =
          "Пожалуйста, выберите минимум один напиток или пункт «Не пью».";
        invalid = true;
      }
      if (invalid) return;

      const drinkLabels = config.rsvp.drinks
        .filter((drink) => selectedDrinks.includes(drink.value))
        .map((drink) => drink.label);
      const attendanceLabel =
        config.rsvp.attendanceOptions.find((option) => option.value === attendance)?.label || "";

      const payload = {
        fullName,
        attendance: attendanceLabel,
        attendanceValue: attendance,
        drinks: attendance === "attending" ? drinkLabels : [],
        drinksText: attendance === "attending" ? drinkLabels.join(", ") : "",
        comment,
        submittedAt: new Date().toISOString(),
      };

      const url = config.rsvp.googleAppsScriptUrl;
      if (!url) {
        status.className = "form-status is-err";
        status.textContent = "Ответ пока не отправлен: ссылка на Google-таблицу ещё не подключена.";
        return;
      }

      submit.disabled = true;
      submit.textContent = "Отправляем…";
      try {
        await fetch(url, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        status.className = "form-status is-ok";
        status.textContent =
          attendance === "attending"
            ? `${fullName}, спасибо! Будем рады видеть вас на празднике.`
            : "Спасибо, что сообщили нам.";
        form.reset();
        drinksPanel.classList.remove("is-hidden");
      } catch {
        status.className = "form-status is-err";
        status.textContent = "Не получилось отправить ответ. Попробуйте ещё раз.";
      } finally {
        submit.disabled = false;
        submit.textContent = config.rsvp.submitButtonText;
      }
    });
  }

  function openModal(id) {
    currentModal = id;
    modalCard.classList.toggle("modal-card-wide", id === "gallery");
    const bodies = {
      invite: inviteHtml,
      program: programHtml,
      wishes: wishesHtml,
      gallery: galleryHtml,
      rsvp: rsvpHtml,
    };
    modalBody.innerHTML = bodies[id]();
    modal.classList.remove("is-hidden");
    lockScroll();
    document.getElementById("modalClose").focus();
    if (id === "rsvp") bindRsvp();
    if (id === "gallery") {
      modalBody.querySelectorAll("[data-lightbox]").forEach((button) => {
        button.addEventListener("click", () => openLightbox(button.getAttribute("data-lightbox")));
      });
    }
  }

  musicBtn.addEventListener("click", () => void toggleMusic());
  document.getElementById("openEnvelope").addEventListener("click", openEnvelope);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", closeModal);
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.getAttribute("data-modal")));
  });

  document.querySelectorAll("[data-scroll]").forEach((button) => {
    button.addEventListener("click", () => {
      document.getElementById(button.getAttribute("data-scroll"))?.scrollIntoView({ behavior: "smooth" });
    });
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!lightbox.classList.contains("is-hidden")) {
      closeLightbox();
      return;
    }
    closeModal();
  });

  tickCountdown();
  window.setInterval(tickCountdown, 1000);
  lockScroll();
})();
