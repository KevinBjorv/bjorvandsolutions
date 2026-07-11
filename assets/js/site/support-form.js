(() => {
  const form = document.querySelector("[data-support-form]");
  const topicSelect = document.getElementById("support-topic");
  const referenceField = document.getElementById("support-reference-field");
  const referenceInput = document.getElementById("support-reference");
  const status = document.querySelector("[data-support-status]");
  const submitButton = document.querySelector("[data-support-submit]");
  const norwegian = document.documentElement.lang === "no";

  if (!(form instanceof HTMLFormElement)) return;

  const referenceTopics = new Set([
    "Build Size Guard",
    "Shader Variant Budget & CI Guard",
    "Unity Serialization Migration Guard",
    "IL2CPP Strip Guard",
    "Inspector Event Link Doctor",
    "Fast Play Mode Safety Guard",
    "Third-Party Notices & Credits",
    "Import Settings Validator & Fix",
    "Smart Indie question",
  ]);

  function updateReferenceVisibility() {
    if (!(topicSelect instanceof HTMLSelectElement) || !(referenceField instanceof HTMLElement) || !(referenceInput instanceof HTMLInputElement)) return;
    const show = referenceTopics.has(topicSelect.value);
    referenceField.hidden = !show;
    referenceInput.disabled = !show;
    if (!show) referenceInput.value = "";
  }

  function fieldMessage(field) {
    if (field.validity.valueMissing) return norwegian ? "Dette feltet må fylles ut." : "This field is required.";
    if (field.validity.typeMismatch) return norwegian ? "Skriv inn en gyldig e-postadresse." : "Enter a valid email address.";
    return norwegian ? "Kontroller dette feltet." : "Check this field.";
  }

  function setFieldError(field, message = "") {
    if (!field.id) return;
    const errorId = `${field.id}-error`;
    let error = document.getElementById(errorId);

    if (!message) {
      field.removeAttribute("aria-invalid");
      error?.remove();
      const descriptions = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter((id) => id && id !== errorId);
      if (descriptions.length) field.setAttribute("aria-describedby", descriptions.join(" "));
      else field.removeAttribute("aria-describedby");
      return;
    }

    if (!error) {
      error = document.createElement("span");
      error.id = errorId;
      error.className = "field-error";
      field.after(error);
    }
    error.textContent = message;
    field.setAttribute("aria-invalid", "true");
    const descriptions = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    descriptions.add(errorId);
    field.setAttribute("aria-describedby", Array.from(descriptions).join(" "));
  }

  function validateField(field) {
    const valid = field.checkValidity();
    setFieldError(field, valid ? "" : fieldMessage(field));
    return valid;
  }

  const validatedFields = Array.from(form.querySelectorAll("input[required], select[required], textarea[required]"));
  validatedFields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
    });
    field.addEventListener("change", () => validateField(field));
    field.addEventListener("invalid", (event) => event.preventDefault());
  });

  form.addEventListener("submit", (event) => {
    const invalidFields = validatedFields.filter((field) => !validateField(field));
    const firstInvalid = invalidFields[0];
    if (firstInvalid) {
      event.preventDefault();
      if (status) {
        status.textContent = norwegian ? "Kontroller feltene som er markert før du sender." : "Check the highlighted fields before sending.";
        status.className = "form-status is-error";
      }
      firstInvalid.focus();
      return;
    }

    form.setAttribute("aria-busy", "true");
    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.lastChild.textContent = norwegian ? " Sender…" : " Sending…";
    }
    if (status) {
      status.textContent = norwegian ? "Sender forespørselen…" : "Sending your request…";
      status.className = "form-status";
    }
  });

  topicSelect?.addEventListener("change", updateReferenceVisibility);
  updateReferenceVisibility();
})();
