(() => {
  const topicSelect = document.getElementById("support-topic");
  const referenceField = document.getElementById("support-reference-field");
  const referenceInput = document.getElementById("support-reference");

  if (
    !(topicSelect instanceof HTMLSelectElement) ||
    !(referenceField instanceof HTMLElement) ||
    !(referenceInput instanceof HTMLInputElement)
  ) {
    return;
  }

  const toolTopics = new Set([
    "Build Size Guard",
    "Third-Party Notices & Credits",
    "Import Settings Validator & Fix",
  ]);

  function updateReferenceVisibility() {
    const showReference = toolTopics.has(topicSelect.value);
    referenceField.hidden = !showReference;
    referenceInput.disabled = !showReference;

    if (!showReference) {
      referenceInput.value = "";
    }
  }

  topicSelect.addEventListener("change", updateReferenceVisibility);
  updateReferenceVisibility();
})();
